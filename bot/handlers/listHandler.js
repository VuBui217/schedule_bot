import { EmbedBuilder } from "discord.js";
import Schedule from "../../backend/models/scheduleModel.js";
import { DateTime } from "luxon";

export async function listHandler(interaction) {
  try {
    const userSchedules = await Schedule.find({ userId: interaction.user.id });

    if (userSchedules.length === 0) {
      return interaction.reply({
        content: "📭 You have no scheduled messages.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📅 Your Scheduled Messages")
      .setColor(0x00aaff)
      .setFooter({ text: "Use /delete or /edit to modify your schedules." });

    userSchedules.forEach((schedule, index) => {
      const formattedTime = DateTime.fromJSDate(schedule.scheduledTime)
        .setZone("America/New_York")
        .toFormat("yyyy-MM-dd HH:mm:ss ZZZZ");

      embed.addFields({
        name: `📌 Schedule ${index + 1}`,
        value: `📍 **Channel:** <#${
          schedule.channelId
        }>\n🕒 **Time:** ${formattedTime} (ET)\n🔄 **Recurrence:** ${
          schedule.recurring
        }\n📝 **Message:** ${schedule.message.substring(0, 100)}...`,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error fetching scheduled messages:", error.message);
    interaction.reply({
      content: "❌ Error retrieving scheduled messages.",
      ephemeral: true,
    });
  }
}
