import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
} from "discord.js";
import { DateTime } from "luxon";
import Schedule from "../../backend/models/scheduleModel.js";

export async function scheduleHandler(interaction) {
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId("channelSelect")
    .setPlaceholder("Select a channel")
    .setMaxValues(1);

  const channelRow = new ActionRowBuilder().addComponents(channelSelect);

  await interaction.reply({
    content: "Please select a channel where the message should be sent:",
    components: [channelRow],
    flags: 64, // Make it private to the user
  });
  //return;
}

export async function handleChannelSelect(interaction) {
  //await interaction.deferUpdate();
  const selectedChannelId = interaction.values[0];

  const modal = new ModalBuilder()
    .setCustomId(`scheduleModal_${selectedChannelId}`)
    .setTitle("Schedule a Message");

  const dateInput = new TextInputBuilder()
    .setCustomId("dateInput")
    .setLabel("Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("2024-08-08")
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId("timeInput")
    .setLabel("Time (HH:mm:ss)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("14:30:00")
    .setRequired(true);

  const messageInput = new TextInputBuilder()
    .setCustomId("messageInput")
    .setLabel("Message")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const recurringInput = new TextInputBuilder()
    .setCustomId("recurringInput")
    .setLabel("Recurrence (none, daily, weekly)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("none")
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(messageInput),
    new ActionRowBuilder().addComponents(recurringInput)
  );

  await interaction.showModal(modal);
}

export async function handleModalSummit(interaction) {
  await interaction.deferReply();
  const selectedChannelId = interaction.customId.split("_")[1];
  const date = interaction.fields.getTextInputValue("dateInput");
  const time = interaction.fields.getTextInputValue("timeInput");
  const message = interaction.fields.getTextInputValue("messageInput");
  const recurring =
    interaction.fields.getTextInputValue("recurringInput") || "none";

  const estTime = DateTime.fromFormat(
    `${date} ${time}`,
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
    const schedule = new Schedule({
      userId: interaction.user.id,
      message,
      channelId: selectedChannelId,
      scheduledTime: estTime.toUTC().toJSDate(),
      recurring,
    });

    await schedule.save();
    interaction.editReply(
      `✅ Message scheduled for ${estTime.toFormat(
        "yyyy-MM-dd HH:mm:ss ZZZZ"
      )} (ET) in <#${selectedChannelId}>`
    );
  } catch (error) {
    console.error("Failed to schedule message:", error.message);
    interaction.editReply("❌ Error scheduling message.");
  }
}
