import express from "express";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required keys",
      });
    }

    // 2. Check authentication
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // 3. Check password
    const isMatchPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isMatchPassword) {
      res.status(401).json({
        message: "Username or password is not correct",
      });
    }

    // Create JWT Token & Response to client
    const jwtPayload = {
      email: existingUser.email,
      id: existingUser.id,
      fullname: existingUser.fullname,
    };

    const token = jwt.sign(jwtPayload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      accessToken: token,
      message: "Login Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
});

authRouter.post("/register", async (req, res) => {
  const { email, fullname, password, rePassword } = req.body;

  try {
    // 1.Validation
    if (!email || !fullname || !password || !rePassword) {
      return res.status(400).json({
        message: "Missing required keys",
      });
    }

    // 2.Check user exist
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User has already exist",
      });
    }

    // 2.1 Check match passwords
    if (password !== rePassword) {
      return res.status(400).json({
        messsage: "Passwords do not match",
      });
    }

    // 3.Create new user, insert to DB
    // 3.1 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3.2 Create new user in object
    const newUser = new UserModel({
      email,
      fullname,
      password: hashedPassword,
    });

    // Insert new user into collection
    newUser.save();

    // 4. Response to client
    res.status(201).json({
      message: "Create new user successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  const { id } = req.user;
  const currentUser = await UserModel.findById(id).select("-password");

  res.json({
    userInfo: currentUser,
  });
});

export default authRouter;
