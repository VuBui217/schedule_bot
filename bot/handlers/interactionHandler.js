import {
  scheduleHandler,
  handleChannelSelect,
  handleModalSummit,
} from "../handlers/scheduleHandler.js";
import {
  editHandler,
  handleEditSelect,
  handleEditModalSubmit,
} from "../handlers/editHandler.js";
import {
  deleteHandler,
  handleDeleteModalSubmit,
  handleDeleteSelect,
} from "./deleteHandler.js";
//import { schedule } from "node-cron";

export async function handleInteraction(interaction) {
  if (interaction.isCommand() && interaction.commandName === "schedule") {
    await scheduleHandler(interaction);
  }

  if (
    interaction.isChannelSelectMenu() &&
    interaction.customId === "channelSelect"
  ) {
    await handleChannelSelect(interaction);
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("scheduleModal_")
  ) {
    await handleModalSummit(interaction);
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
  if (interaction.isCommand() && interaction.commandName === "delete") {
    await deleteHandler(interaction);
  }
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "deleteScheduleSelect"
  ) {
    await handleDeleteSelect(interaction);
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("deleteConfirmModal_")
  ) {
    await handleDeleteModalSubmit(interaction);
  }
}
