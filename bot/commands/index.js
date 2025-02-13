import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { scheduleCommand } from "./schedule.js";
import { editCommand } from "./edit.js";
import { deleteCommand } from "./delete.js";

const commands = [
  scheduleCommand.toJSON(),
  editCommand.toJSON(),
  deleteCommand.toJSON(),
];

export async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Failed to reload application (/) commands:", error);
  }
}
