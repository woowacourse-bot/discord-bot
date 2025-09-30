import { REST, Routes, Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import about from './interactions/command/about.js';
import channelCreatePermissions from './event/channel/channelCreatePermissions.js';
import ABOUT from './constants/commands.js';
import pr from './event/message/pr.js';
import news from './event/message/news.js';
import GuildMemberAddOnboarding from './event/guild/GuildMemberAddOnboarding.js';
import verify from './event/message/verify.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: ABOUT });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.on(Events.MessageCreate, async (message) => {
  // DM 메시지 수신 확인용 로그
  if (!message.guild) {
    console.log(`[DM] Received from ${message.author.username}: "${message.content}"`);
  }
  
  await pr(message);
  await news(message);
  await verify(message);
});

client.on(Events.ClientReady, async () => {
  await readyPermissions(client);
});

client.on(Events.InteractionCreate, about);

client.on(Events.ChannelCreate, async (channel) => {
  await channelCreatePermissions(channel, client);
});

client.on(Events.GuildMemberAdd, GuildMemberAddOnboarding);

client.login(process.env.DISCORD_TOKEN);
