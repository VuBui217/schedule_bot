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
  if (interaction.isCommand()) {
    if (interaction.commandName === "schedule") {
      await scheduleHandler(interaction);
    } else if (interaction.commandName === "edit") {
      await editHandler(interaction);
    } else if (interaction.commandName === "delete") {
      await deleteHandler(interaction);
    }
    return;
  }

  if (interaction.isChannelSelectMenu()) {
    if (interaction.customId === "channelSelect") {
      await handleChannelSelect(interaction);
    }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "editScheduleSelect") {
      await handleEditSelect(interaction);
    } else if (interaction.customId === "deleteScheduleSelect") {
      await handleDeleteSelect(interaction);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("scheduleModal_")) {
      await handleModalSummit(interaction);
    } else if (interaction.customId.startsWith("editScheduleModal_")) {
      await handleEditModalSubmit(interaction);
    } else if (interaction.customId.startsWith("deleteConfirmModal_")) {
      await handleDeleteModalSubmit(interaction);
    }
    return;
  }
}
