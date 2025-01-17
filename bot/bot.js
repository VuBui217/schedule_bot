// Import rewuired module from the discord.js library
const { Client, GatewayIntentBits } = require("discord.js");
// Import the dotenv module to load environment variables from .env file
require("dotenv").config();

// Create a new Discord bot client instance
// Specify intents to define what kind of events the bot should listen to
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Event listener fro the 'ready' event
// This event is triggered when the bot successfully connects to Discord
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});
// Log the bot into Discord using the token stored in the .env file
// The token is used to authenticate the bot with discord's api
client.login(process.env.DISCORD_TOKEN);

// Export the bot client instance for use in other parts of the project
module.exports = client;
