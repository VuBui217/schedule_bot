import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from "discord.js";
import Schedule from "../../backend/models/scheduleModel.js";
import { DateTime } from "luxon";

export async function viewHandler(interaction) {
  try {
    const userSchedules = await Schedule.find({ userId: interaction.user.id });

    if (userSchedules.length === 0) {
      return interaction.reply({
        content: "❌ You don't have any scheduled messages to view.",
        flags: 64,
      });
    }

    const scheduleOptions = userSchedules.map((schedule) => ({
      label: `Message for ${DateTime.fromJSDate(
        schedule.scheduledTime
      ).toFormat("yyyy-MM-dd HH:mm:ss")} (ET)`,
      value: schedule._id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("viewScheduleSelect")
      .setPlaceholder("Select a scheduled message to view")
      .addOptions(scheduleOptions);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "📌 Select a scheduled message to view:",
      components: [actionRow],
      flags: 64,
    });
  } catch (error) {
    console.error("Error fetching scheduled messages:", error.message);
    interaction.reply({
      content: "❌ Error retrieving scheduled messages.",
      flags: 64,
    });
  }
}

export async function handleViewSelect(interaction) {
  const scheduleId = interaction.values[0];

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.reply({
        content: "❌ The selected scheduled message was not found.",
        flags: 64,
      });
    }

    const estTime = DateTime.fromJSDate(schedule.scheduledTime)
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss ZZZZ");

    const embed = new EmbedBuilder()
      .setTitle("📅 Scheduled Message Details")
      .setColor(0x00aaff)
      .addFields(
        { name: "📍 Channel", value: `<#${schedule.channelId}>`, inline: true },
        { name: "🕒 Scheduled Time", value: `${estTime} (ET)`, inline: true },
        {
          name: "🔄 Recurrence",
          value: schedule.recurring || "None",
          inline: true,
        },
        { name: "📝 Message", value: schedule.message }
      );

    await interaction.reply({ embeds: [embed], flags: 64 });
  } catch (error) {
    console.error("Error fetching scheduled message:", error.message);
    interaction.reply({
      content: "❌ Error retrieving the scheduled message details.",
      flags: 64,
    });
  }
}
