import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

export const connectToDatabase = async () => {
    try {
      const connection = await mongoose.connect(MONGO_URL);
      console.log(`Database is connected at ${connection.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };