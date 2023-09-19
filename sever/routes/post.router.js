import express from "express";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import uploadFile from "../configs/multer.config.js";
import fs from "fs";
import PostModel from "../models/post.model.js";

cloudinary.config({
  cloud_name: "dpvataszc",
  api_key: "143841624251247",
  api_secret: "Q5XSEWMBIqqvdX1w7D46XclkgvE",
});

const postRouter = express.Router();
postRouter.use(bodyParser.json());

postRouter.post(
  "/add-new",
  authMiddleware,
  uploadFile.single("coverImage"),
  async (req, res) => {
    const { id, fullname } = req.user;
    console.log(id, fullname);
    try {
      // 1. Add data from client to sever
      const file = req.file;
      const { status, content } = req.body;
      if ((!status, !content)) {
        return res.status(400).json({
          message: "Missing required keys",
        });
      }
      // 2. Upload image to cloudinary => url
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "final-project",
      });

      // 3. Remove temp image
      fs.unlinkSync(file.path);

      // 4. Get imageUrl
      const imageUrl = result && result.secure_url;

      // 5. Create new post, insert to DB
      const newPost = new PostModel({
        userId: id,
        owner: fullname,
        imageUrl,
        status,
        content,
      });

      newPost.save();

      //6. Response to client
      res.status(201).json({
        message: "Create new post successfully",
        data: newPost,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
      });
    }
  }
);

postRouter.get("/all-posts", async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

postRouter.get("/detail-post/:postId", async (req, res) => {
  const {postId} = req.params;
  try {
    const post = await PostModel.findById(postId);
    if(!post) {
      res.status(404).json({
        message: "Bài viết không tồn tại"
      });
    };

    res.status(200).json({
      data: post
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi sever"
    })
  }
});

postRouter.post("/toggle-like/:postId", authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const { postId } = req.params;

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại." });
    }

    // Kiểm tra xem người dùng đã like bài viết chưa
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Nếu đã like, giảm đi 1 like và loại bỏ userId khỏi mảng likes
      post.likes = post.likes.filter((likeId) => likeId !== userId);
    } else {
      // Nếu chưa like, tăng thêm 1 like và thêm userId vào mảng likes
      post.likes.push(userId);
    }

    await post.save();

    res
      .status(200)
      .json({ message: "Thay đổi thành công.", likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server." });
  }
});

postRouter.post("/add-comment/:postId", authMiddleware, async (req, res) => {
  const { fullname: userName } = req.user;
  const { postId } = req.params;
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(401).json({
        message: "Vui lòng nhập vào nội dung bình luận!",
      });
    } else {
      const comment = {
        by: userName,
        content: text,
      };

      const post = await PostModel.findById(postId);

      if (!post) {
        res.status(404).json({
          message: "Bài viết không tồn tại",
        });
      }

      post.comments.push(comment);
      await post.save();
      console.log(text);
      res.status(200).json({
        message: "Thêm bình luận thành công",
        data: comment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi sever.",
    });
  }
});

export default postRouter;
