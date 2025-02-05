/**
 * 'schedule' command
 */

import { SlashCommandBuilder } from "discord.js";

export const scheduleCommand = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("Schedule a message to be sent at a specific time");
