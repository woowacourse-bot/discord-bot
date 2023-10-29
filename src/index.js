import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import readyPermissions from './handlers/channel/readyPermissions.js';

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
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'developer') {
    await interaction.reply('https://github.com/woowacourse-bot/discord-bot');
  }
});
// refactor
client.on('channelCreate', async (channel) => {
  try {
    // 채널을 만든 사용자의 정보를 가져옵니다.
    const logs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 10,
    });

    const creatorId = logs.entries.first().executor.id;
    const creator = await channel.guild.members.fetch(creatorId);

    // 생성자에게만 'MANAGE_CHANNELS' 권한 부여
    await channel.permissionOverwrites.edit(creator.id, {
      ManageChannels: true,
    });

    // @everyone에 대한 'MANAGE_CHANNELS' 권한 제거
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      ManageChannels: false,
    });
  } catch (error) {
    console.error('Error setting permissions:', error);
  }
});

// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
client.login(process.env.DISCORD_TOKEN);
