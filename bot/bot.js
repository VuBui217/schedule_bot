import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ComponentType,
} from "discord.js";

import dotenv from "dotenv";

import { connectToDatabase } from "./utils/database.js";
import { DateTime } from "luxon";

import Schedule from "../backend/models/scheduleModel.js"; // Ensure this uses `.js`
import { startScheduler } from "../backend/scheduler.js"; // Import scheduler
dotenv.config();

await connectToDatabase(); // Ensure connection before proceeding

// Create a new Discord bot client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Define the /schedule command
const commands = [
  {
    name: "schedule",
    description: "Schedule a message to be sent at a specific time",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Failed to reload application (/) commands:", error);
  }
})();

// Event listener for bot readiness
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  startScheduler();
});

// Handle interaction commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "schedule") {
    // Step 1: Ask user to select a channel
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId("channelSelect")
      .setPlaceholder("Select a channel")
      .setMaxValues(1); // Allow selecting one channel

    const channelRow = new ActionRowBuilder().addComponents(channelSelect);

    await interaction.reply({
      content: "Please select a channel where the message should be sent:",
      components: [channelRow],
      flags: 64, // Make it private to the user
    });
  }
});

// Handle channel selection
client.on("interactionCreate", async (interaction) => {
  if (
    !interaction.isChannelSelectMenu() ||
    interaction.customId !== "channelSelect"
  )
    return;

  //await interaction.deferUpdate(); // ✅ Acknowledge the interaction immediately

  const selectedChannelId = interaction.values[0]; // Get selected channel

  // Debugging: Log channel ID
  console.log(`✅ Selected Channel ID: ${selectedChannelId}`);
  // Step 2: Show the scheduling modal after selecting the channel
  const modal = new ModalBuilder()
    .setCustomId(`scheduleModal_${selectedChannelId}`) // Pass channel ID in customId
    .setTitle("Schedule a Message");

  const dateInput = new TextInputBuilder()
    .setCustomId("dateInput")
    .setLabel("Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("2023-12-25")
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId("timeInput")
    .setLabel("Time (HH:mm:ss)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("14:30:00")
    .setRequired(true);

  const messageInput = new TextInputBuilder()
    .setCustomId("messageInput")
    .setLabel("Message")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const recurringInput = new TextInputBuilder()
    .setCustomId("recurringInput")
    .setLabel("Recurrence (none, daily, weekly)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("none")
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(messageInput),
    new ActionRowBuilder().addComponents(recurringInput)
  );

  try {
    await interaction.showModal(modal); // ✅ Ensure this executes
  } catch (error) {
    console.error("❌ Error displaying modal:", error);
  }
});

// Handle modal submissions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return; // ✅ Ensure only modal interactions are processed

  if (!interaction.customId.startsWith("scheduleModal_")) return;

  await interaction.deferReply(); // ✅ Defer reply so Discord doesn't timeout

  const selectedChannelId = interaction.customId.split("_")[1]; // Extract channel ID
  const date = interaction.fields.getTextInputValue("dateInput");
  const time = interaction.fields.getTextInputValue("timeInput");
  const message = interaction.fields.getTextInputValue("messageInput");
  const recurring =
    interaction.fields.getTextInputValue("recurringInput") || "none";

  // Interpret user input as EST
  const estTime = DateTime.fromFormat(
    `${date} ${time}`,
    "yyyy-MM-dd HH:mm:ss",
    {
      zone: "America/New_York",
    }
  );

  // Convert to UTC for storage
  const utcTime = estTime.toUTC();

  // Validate time format
  if (!estTime.isValid) {
    return interaction.editReply(
      "Invalid date or time format. Please use YYYY-MM-DD for the date and HH:mm:ss for the time."
    );
  }

  try {
    const schedule = new Schedule({
      userId: interaction.user.id,
      message,
      channelId: selectedChannelId, // ✅ Store the selected channel
      scheduledTime: utcTime.toJSDate(), // Store in UTC
      recurring,
    });

    await schedule.save();
    interaction.editReply(
      `✅ Message scheduled successfully for ${estTime.toFormat(
        "yyyy-MM-dd HH:mm:ss ZZZZ"
      )} (ET) in <#${selectedChannelId}>`
    );
  } catch (error) {
    console.error("Failed to schedule message:", error.message);
    interaction.editReply("❌ An error occurred while scheduling the message.");
  }
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN);

export default client;
