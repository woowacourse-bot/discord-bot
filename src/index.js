import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import channelCreatePermissions from './handlers/channel/channelCreatePermissions.js';
import about from './interactions/command/about.js';

// for Refactor
const commands = [
  {
    name: 'developer',
    description: 'Discord-bot Github Repository',
  },
];
// refactor
// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  // SETTINGS - General Information - APPLICATION ID를 applicationCommands의 인수로 넣어주세요.
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  await readyPermissions(client);
});
// refactor
client.on('interactionCreate', async (interaction) => {
  await about(interaction);
});
// refactor
client.on('channelCreate', async (channel) => {
  await channelCreatePermissions(channel);
});

// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
client.login(process.env.DISCORD_TOKEN);
