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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, async () => {
  await readyPermissions(client);
});

client.on(Events.InteractionCreate, about);

client.on(Events.ChannelCreate, async (channel) => {
  await channelCreatePermissions(channel, client);
});

client.login(process.env.DISCORD_TOKEN);
