/**
 * 'delete' command
 */
import { SlashCommandBuilder } from "discord.js";

export const deleteCommand = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("Delete a scheduled message");
