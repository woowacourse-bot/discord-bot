import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';
import channelCreatePermissions from './handlers/channel/channelCreatePermissions.js';
import about from './interactions/command/about.js';

const commands = [
  {
    name: 'developer',
    description: 'Discord-bot Github Repository',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  await readyPermissions(client);
});

client.on('interactionCreate', about);

client.on('channelCreate', async (channel) => {
  await channelCreatePermissions(channel, client);
});

client.login(process.env.DISCORD_TOKEN);
