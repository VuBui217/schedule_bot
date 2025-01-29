import express from "express";
import Schedule from "../models/scheduleModel.js"; // Ensure `.js` is included

const router = express.Router();

// Add a new schedule
router.post("/", async (req, res) => {
  const { message, channelId, scheduledTime, recurring } = req.body;

  try {
    const schedule = new Schedule({
      message,
      channelId,
      scheduledTime,
      recurring,
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch all schedules
router.get("/", async (req, res) => {
  const schedules = await Schedule.find();
  res.json(schedules);
});

export default router;
