import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import Schedule from "../../backend/models/scheduleModel.js";
import { DateTime } from "luxon";

export async function editHandler(interaction) {
  try {
    const userSchedules = await Schedule.find({ userId: interaction.user.id });

    if (userSchedules.length === 0) {
      return interaction.reply({
        content: "❌ You don't have any scheduled messages to edit.",
        ephemeral: true,
      });
    }

    const scheduleOptions = userSchedules.map((schedule) => ({
      label: `Message for ${DateTime.fromJSDate(
        schedule.scheduledTime
      ).toFormat("yyyy-MM-dd HH:mm:ss")} (ET)`,
      value: schedule._id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("editScheduleSelect")
      .setPlaceholder("Select a scheduled message to edit")
      .addOptions(scheduleOptions);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "📌 Select a scheduled message to edit:",
      components: [actionRow],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error fetching scheduled messages:", error.message);
    interaction.reply({
      content: "❌ Error retrieving scheduled messages.",
      ephemeral: true,
    });
  }
}

export async function handleEditSelect(interaction) {
  const scheduleId = interaction.values[0];

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.reply({
        content: "❌ The selected schedule was not found.",
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`editScheduleModal_${scheduleId}`)
      .setTitle("Edit Scheduled Message");

    const dateInput = new TextInputBuilder()
      .setCustomId("editDateInput")
      .setLabel("New Date (YYYY-MM-DD)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(schedule.scheduledTime.toISOString().split("T")[0])
      .setRequired(true);

    const timeInput = new TextInputBuilder()
      .setCustomId("editTimeInput")
      .setLabel("New Time (HH:mm:ss)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        DateTime.fromJSDate(schedule.scheduledTime).toFormat("HH:mm:ss")
      )
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId("editMessageInput")
      .setLabel("New Message")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(schedule.message)
      .setRequired(true);

    const recurringInput = new TextInputBuilder()
      .setCustomId("editRecurringInput")
      .setLabel("Recurrence (none, daily, weekly)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(schedule.recurring || "none")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(dateInput),
      new ActionRowBuilder().addComponents(timeInput),
      new ActionRowBuilder().addComponents(messageInput),
      new ActionRowBuilder().addComponents(recurringInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error fetching schedule for edit:", error.message);
    interaction.reply({
      content: "❌ Error loading schedule details.",
      ephemeral: true,
    });
  }
}

export async function handleEditModalSubmit(interaction) {
  await interaction.deferReply();
  const scheduleId = interaction.customId.split("_")[1];

  const newDate = interaction.fields.getTextInputValue("editDateInput");
  const newTime = interaction.fields.getTextInputValue("editTimeInput");
  const newMessage = interaction.fields.getTextInputValue("editMessageInput");
  const newRecurring =
    interaction.fields.getTextInputValue("editRecurringInput") || "none";

  const estTime = DateTime.fromFormat(
    `${newDate} ${newTime}`,
    "yyyy-MM-dd HH:mm:ss",
    {
      zone: "America/New_York",
    }
  );

  if (!estTime.isValid) {
    return interaction.editReply(
      "Invalid date or time format. Use YYYY-MM-DD and HH:mm:ss."
    );
  }

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.editReply("❌ Scheduled message not found.");
    }

    schedule.scheduledTime = estTime.toUTC().toJSDate();
    schedule.message = newMessage;
    schedule.recurring = newRecurring;

    await schedule.save();

    interaction.editReply(
      `✅ Message updated for ${estTime.toFormat(
        "yyyy-MM-dd HH:mm:ss ZZZZ"
      )} (ET) in <#${schedule.channelId}>`
    );
  } catch (error) {
    console.error("Error updating schedule:", error.message);
    interaction.editReply("❌ Error updating the scheduled message.");
  }
}
