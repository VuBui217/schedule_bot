/**
 * 'list' command
 */
import { SlashCommandBuilder } from "discord.js";

export const listCommand = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("List all scheduled messages");
