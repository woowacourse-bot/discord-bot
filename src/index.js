import { REST, Routes, Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import about from './interactions/command/about.js';
import channelCreatePermissions from './event/channel/channelCreatePermissions.js';
import dice from './event/message/dice.js';
import ABOUT from './constants/commands.js';
import pr from './event/message/pr.js';
import news from './event/message/news.js';
import verify from './event/message/verify.js';
import guildMemberAddOnboarding from './event/guild/GuildMemberAddOnboarding.js';

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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,  // 새 회원 감지를 위해 추가
  ],
});

client.on(Events.MessageCreate, pr);
client.on(Events.MessageCreate, dice);
client.on(Events.MessageCreate, news);
client.on(Events.MessageCreate, verify);

client.on(Events.ClientReady, async () => {
  await readyPermissions(client);
});

client.on(Events.InteractionCreate, about);

client.on(Events.ChannelCreate, async (channel) => {
  await channelCreatePermissions(channel, client);
});

// 새 회원 가입시 자동 온보딩 트리거
client.on(Events.GuildMemberAdd, guildMemberAddOnboarding);

client.login(process.env.DISCORD_TOKEN);
