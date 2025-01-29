import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import scheduleRoutes from "./routes/scheduleRoutes.js"; // Ensure `.js` is included

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use("/api/schedules", scheduleRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
