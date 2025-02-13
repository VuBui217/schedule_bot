import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Schedule from "../../backend/models/scheduleModel.js";

export async function deleteHandler(interaction) {
  try {
    const userSchedules = await Schedule.find({ userId: interaction.user.id });

    if (userSchedules.length === 0) {
      return interaction.reply({
        content: "❌ You don't have any scheduled messages to delete.",
        //flags: 64,
      });
    }

    const scheduleOptions = userSchedules.map((schedule) => ({
      label: `Message for ${
        schedule.scheduledTime.toISOString().replace("T", " ").split(".")[0]
      } UTC`,
      value: schedule._id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("deleteScheduleSelect")
      .setPlaceholder("Select a scheduled message to delete")
      .addOptions(scheduleOptions);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "🗑️ Select a scheduled message to delete:",
      components: [actionRow],
      //flags: 64,
    });
  } catch (error) {
    console.error("Error fetching scheduled messages:", error.message);
    interaction.reply({
      content: "❌ Error retrieving scheduled messages.",
      //flags: 64,
    });
  }
}
/** 
export async function handleDeleteSelect(interaction) {
  const scheduleId = interaction.values[0];

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.reply({
        content: "❌ The selected schedule was not found.",
        //flags: 64,
      });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    return interaction.reply({
      content: `✅ The scheduled message has been deleted.`,
      //flags: true,
    });
  } catch (error) {
    console.error("Error deleting schedule:", error.message);
    interaction.reply({
      content: "❌ Error deleting the scheduled message.",
      //flags: 64,
    });
  }
}*/
export async function handleDeleteSelect(interaction) {
  const scheduleId = interaction.values[0];

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.reply({
        content: "❌ The selected schedule was not found.",
        //ephemeral: true,
      });
    }

    // Show a confirmation modal
    const modal = new ModalBuilder()
      .setCustomId(`deleteConfirmModal_${scheduleId}`)
      .setTitle("Confirm Deletion");

    const confirmInput = new TextInputBuilder()
      .setCustomId("confirmDeleteInput")
      .setLabel("Type 'DELETE' to confirm")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("DELETE")
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(confirmInput));

    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error fetching schedule for delete:", error.message);
    interaction.reply({
      content: "❌ Error loading schedule details.",
      //ephemeral: true,
    });
  }
}
export async function handleDeleteModalSubmit(interaction) {
  await interaction.deferReply();
  const scheduleId = interaction.customId.split("_")[1];
  const confirmationText =
    interaction.fields.getTextInputValue("confirmDeleteInput");

  if (confirmationText !== "DELETE") {
    return interaction.editReply({
      content: "❌ Deletion canceled. You must type 'DELETE' to confirm.",
      ephemeral: true,
    });
  }

  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return interaction.editReply({
        content: "❌ Scheduled message not found.",
        ephemeral: true,
      });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    interaction.editReply({
      content: `✅ Successfully deleted the scheduled message for <#${
        schedule.channelId
      }> at ${new Date(schedule.scheduledTime).toLocaleString()} (ET).`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error deleting scheduled message:", error.message);
    interaction.editReply({
      content: "❌ Error deleting the scheduled message.",
      ephemeral: true,
    });
  }
}
