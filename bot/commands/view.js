/**
 * 'view' command
 */
import { SlashCommandBuilder } from "discord.js";

export const viewCommand = new SlashCommandBuilder()
  .setName("view")
  .setDescription("View a scheduled message");
