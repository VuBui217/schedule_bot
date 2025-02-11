import { scheduleHandler } from "../handlers/scheduleHandler.js";
import {
  editHandler,
  handleEditSelect,
  handleEditModalSubmit,
} from "../handlers/editHandler.js";
//import { schedule } from "node-cron";

export async function handleInteraction(interaction) {
  if (interaction.isCommand() && interaction.commandName === "schedule") {
    await scheduleHandler(interaction);
  }

  if (
    interaction.isChannelSelectMenu() &&
    interaction.customId === "channelSelect"
  ) {
    await scheduleHandler(interaction);
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("scheduleModal_")
  ) {
    await scheduleHandler(interaction);
  }
  if (interaction.isCommand() && interaction.commandName === "edit") {
    await editHandler(interaction);
  }

  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "editScheduleSelect"
  ) {
    await handleEditSelect(interaction);
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("editScheduleModal_")
  ) {
    await handleEditModalSubmit(interaction);
  }
}
