import cron from "node-cron";
import { DateTime } from "luxon";
import Schedule from "../backend/models/scheduleModel.js";
import client from "../bot/bot.js"; // Import the bot instance

// Function to execute scheduled messages
async function executeScheduledMessages() {
  const nowEST = DateTime.now().setZone("America/New_York");
  const nowUTC = nowEST.toUTC().toJSDate();

  console.log(
    `⏳ Checking scheduled messages for ${nowEST.toFormat(
      "yyyy-MM-dd HH:mm:ss ZZZZ"
    )}`
  );

  const schedules = await Schedule.find({ scheduledTime: { $lte: nowUTC } });

  for (const schedule of schedules) {
    try {
      const channel = await client.channels.fetch(schedule.channelId);
      if (channel) {
        await channel.send(schedule.message);
        console.log(
          `📩 Message sent at ${nowEST.toFormat("yyyy-MM-dd HH:mm:ss ZZZZ")}`
        );
      }

      if (schedule.recurring === "none") {
        await Schedule.deleteOne({ _id: schedule._id });
        console.log("🗑️ Deleted non-recurring message.");
      } else {
        let nextTimeEST = DateTime.fromJSDate(schedule.scheduledTime, {
          zone: "utc",
        }).setZone("America/New_York");

        if (schedule.recurring === "daily")
          nextTimeEST = nextTimeEST.plus({ days: 1 });
        if (schedule.recurring === "weekly")
          nextTimeEST = nextTimeEST.plus({ weeks: 1 });

        schedule.scheduledTime = nextTimeEST.toUTC().toJSDate();
        await schedule.save();
        console.log(
          `🔁 Updated recurring schedule: ${nextTimeEST.toFormat(
            "yyyy-MM-dd HH:mm:ss ZZZZ"
          )}`
        );
      }
    } catch (error) {
      console.error(`❌ Error sending message: ${error.message}`);
    }
  }
}

// Function to start the scheduler
export function startScheduler() {
  console.log("⏳ Scheduler is now running...");
  cron.schedule("* * * * *", executeScheduledMessages);
}
