import { REST, Routes, Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import about from './interactions/command/about.js';
import channelCreatePermissions from './event/channel/channelCreatePermissions.js';
import ABOUT from './constants/commands.js';
import pr from './event/message/pr.js';
import news from './event/message/news.js';
import GuildMemberAddOnboarding from './event/guild/GuildMemberAddOnboarding.js';
import GuildMemberUpdateOnboarding from './event/guild/GuildMemberUpdateOnboarding.js';
import verify from './event/message/verify.js';
import notifyRoleFailures from './utils/notifyRoleFailures.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  // eslint-disable-next-line no-console
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: ABOUT });

  // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(`[DM] Received from ${message.author.username}: "${message.content}"`);
  }
  
  await pr(message);
  await news(message);
  await verify(message);
});

client.on(Events.ClientReady, async () => {
  await readyPermissions(client);

  // 역할 부여 실패 재시도 및 공지 (5분마다)
  setInterval(async () => {
    await notifyRoleFailures(client);
  }, 5 * 60 * 1000);

  // 봇 시작 직후 즉시 한 번 실행
  await notifyRoleFailures(client);
});

client.on(Events.InteractionCreate, about);

client.on(Events.ChannelCreate, async (channel) => {
  await channelCreatePermissions(channel, client);
});

client.on(Events.GuildMemberAdd, GuildMemberAddOnboarding);

client.on(Events.GuildMemberUpdate, GuildMemberUpdateOnboarding);

client.login(process.env.DISCORD_TOKEN);
