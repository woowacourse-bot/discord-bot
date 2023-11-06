import { REST, Routes, Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import about from './interactions/command/about.js';
import channelCreatePermissions from './event/channel/channelCreatePermissions.js';
import ABOUT from './constants/commands.js';

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
  ],
});
const prefix = '&'; // 봇 명령어 접두사

client.on('messageCreate', (message) => {
  // 메시지가 봇의 메시지이거나 접두사를 가지고 있지 않으면 무시
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  // 명령어를 추출하고 공백을 기준으로 나눔
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 주사위 명령어를 처리
  if (command === '주사위') {
    // 1에서 100 사이의 랜덤한 숫자 생성
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    // 결과를 메시지로 보냄
    message.reply(`주사위 결과: ${randomNumber}`);
  }
});

client.on(Events.ClientReady, async () => {
  await readyPermissions(client);
});

client.on(Events.InteractionCreate, about);

client.on(Events.ChannelCreate, async (channel) => {
  await channelCreatePermissions(channel, client);
});

client.login(process.env.DISCORD_TOKEN);
