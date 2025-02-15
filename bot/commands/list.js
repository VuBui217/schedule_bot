/**
 * 'list' command
 */
import { SlashCommandBuilder } from "discord.js";

export const listCommand = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List all scheduled messages");
