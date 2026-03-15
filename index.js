// Load environment variables
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Staff log channel ID
const LOG_CHANNEL_ID = "1423503207719768158";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "!";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const command = message.content.slice(PREFIX.length).toLowerCase();

  if (command === "logstaff") {
    let messages = [];
    let lastId;

    // Fetch all messages from the ticket channel
    while (true) {
      const fetched = await message.channel.messages.fetch({
        limit: 100,
        before: lastId
      });
      if (fetched.size === 0) break;
      messages.push(...fetched.values());
      lastId = fetched.last().id;
    }

    messages = messages.reverse();

    // Create text log
    const log = messages.map(m =>
      `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`
    ).join("\n");

    fs.writeFileSync("ticket-log.txt", log);

    // Send to staff log channel
    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) {
      return message.reply("Staff log channel not found.");
    }

    await logChannel.send({
      content: `Ticket log from ${message.channel.name} | Logged by ${message.author.tag}`,
      files: ["ticket-log.txt"]
    });

    message.reply("Ticket log has been sent to staff logs.");
  }
});

// Login using the token from .env
client.login(process.env.TOKEN);