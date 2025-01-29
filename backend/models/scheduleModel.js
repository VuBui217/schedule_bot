import { Schema, model } from "mongoose";

const scheduleSchema = new Schema({
  message: { type: String, required: true },
  channelId: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  recurring: {
    type: String,
    enum: ["none", "daily", "weekly"],
    default: "none",
  },
});

export default model("Schedule", scheduleSchema);
