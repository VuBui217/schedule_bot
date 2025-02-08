import { scheduleHandler } from "../handlers/scheduleHandler.js";
import { editHandler } from "../handlers/editHandler.js";
import { schedule } from "node-cron";

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
}
