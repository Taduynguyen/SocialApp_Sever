import express from "express";
import uploadFile from "../configs/multer.config.js";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "../models/user.model.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import fs from "fs";

cloudinary.config({
  cloud_name: "dpvataszc",
  api_key: "143841624251247",
  api_secret: "Q5XSEWMBIqqvdX1w7D46XclkgvE",
});

const userRouter = express.Router();

userRouter.post("/", (req, res) => {
  res.send("API User");
});

userRouter.post(
  "/upload-avatar",
  authMiddleware,
  uploadFile.single("avatar"),
  async (req, res) => {
    const { id } = req.user;
    // 1. Add file from client to sever
    const file = req.file;

    // 2. Upload image to cloudinary => URL
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: "final-project",
    });

    // 3. Remove temp image
    fs.unlinkSync(file.path);

    const avatarUrl = result && result.secure_url;
    // 4. Url => Mongodb
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { avatar: avatarUrl },
      { new: true }
    );
    return res.json({
      message: "Upload avatar successfully",
      data: updatedUser,
    });
  }
);

userRouter.post("/upload-profile", authMiddleware, async (req, res) => {
  try {
    const { id } = req.user;
    const { fullname, address, phoneNumber, about } = req.body;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        fullname: fullname,
        address: address,
        phoneNumber: phoneNumber,
        about: about,
      },

      { new: true }
    );

    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User is non-existent",
      });
    }

    return res.json({
      message: "Updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
});

export default userRouter;
