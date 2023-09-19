import express from "express";
import authRouter from "./auth.router.js";
import userRouter from "./user.route.js"
import postRouter from "./post.router.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter );
router.use("/posts", postRouter);

export default router;