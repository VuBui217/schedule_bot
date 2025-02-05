import { Client, GatewayIntentBits } from "discord.js";
import { connectToDatabase } from "./utils/database.js";
import { registerCommands } from "./commands/index.js";
import { handleInteraction } from "./handlers/interactionHandler.js";
import { startScheduler } from "../backend/scheduler.js";
import dotenv from "dotenv";
dotenv.config();

await connectToDatabase();
await registerCommands();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  startScheduler();
});

client.on("interactionCreate", handleInteraction);
client.login(process.env.DISCORD_TOKEN);

export default client;
