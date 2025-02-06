/**
 * 'edit' command
 */
import { SlashCommandBuilder } from "discord.js";

export const editCommand = new SlashCommandBuilder()
  .setName("edit")
  .setDescription("Edit a scheduled message");
