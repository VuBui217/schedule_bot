import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import Schedule from "../../backend/models/scheduleModel.js";

export async function editHandler(interaction) {
  const userId = interaction.user.id;
  const scheduledMessages = await Schedule.find({ userId });

  if (scheduledMessages.length === 0) {
    return interaction.reply({
      content: "❌ You have no scheduled messages to edit.",
      flags: 64,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("editModal")
    .setTitle("Edit Scheduled Message");

  const messageIdInput = new TextInputBuilder()
    .setCustomId("messageIdInput")
    .setLabel("Message ID to Edit")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const newMessageInput = new TextInputBuilder()
    .setCustomId("newMessageInput")
    .setLabel("New Message Content")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(messageIdInput),
    new ActionRowBuilder().addComponents(newMessageInput)
  );

  await interaction.showModal(modal);
}
