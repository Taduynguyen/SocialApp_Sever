import "dotenv/config";
import express from "express";

import { connectToDatabase } from "./configs/db.config.js";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT;

// 1. Create connection to database
connectToDatabase();

// 2. Global middlewares
app.use(express.json());
app.use(cors("*"));

// 3. Routing
app.use("/api/v1", router)

// 4. Error handling

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
  });