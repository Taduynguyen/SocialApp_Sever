import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
    },
    likes: {
        type: Array,
        default: [],
    },
    comments: {
        type: Array,
    },
});

const PostModel = mongoose.model("posts", PostSchema);

export default PostModel;