import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';

const commands = [
  {
    name: 'developer',
    description: 'Discord-bot Github Repository',
  },
];

// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  // SETTINGS - General Information - APPLICATION ID를 applicationCommands의 인수로 넣어주세요.
  await rest.put(Routes.applicationCommands('1167009894629642240'), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  try {
    // '스스로 만들기' 카테고리의 ID를 확인합니다.
    const guild = client.guilds.cache.get(process.env.APP_ID); // 해당 서버의 ID를 넣어야 합니다.
    const category = guild.channels.cache.find((ch) => ch.name === '스스로 만들기');
    if (!category) {
      console.error("Category '스스로 만들기' not found.");
      return;
    }

    // '스스로 만들기' 카테고리에 속한 채널들을 가져옵니다.
    const channelsInCategory = guild.channels.cache.filter((ch) => ch.parentId === category.id);

    // 각 채널에 권한을 설정합니다.
    channelsInCategory.forEach(async (channel) => {
      try {
        // 채널을 만든 사용자의 정보를 가져옵니다.
        const logs = await guild.fetchAuditLogs({
          limit: 100,
          type: 10,
        });
        const channelLog = logs.entries.find((entry) => entry.target.id === channel.id);
        if (!channelLog) {
          // 해당 채널의 생성 로그 항목이 없는 경우
          return;
        }

        // 생성자 ID를 가져옵니다.
        const creatorId = channelLog.executor.id;
        const creator = await channel.guild.members.fetch(creatorId);

        // 생성자에게만 'MANAGE_CHANNELS' 권한 부여
        await channel.permissionOverwrites.edit(creator.id, {
          ManageChannels: true,
        });

        // @everyone에 대한 'MANAGE_CHANNELS' 권한 제거
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          ManageChannels: false,
        });
      } catch (error) {
        console.error(`Error setting permissions for channel ${channel.name}:`, error);
      }
    });
  } catch (error) {
    console.error('Error setting permissions for channels in category:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'developer') {
    await interaction.reply('https://github.com/woowacourse-bot/discord-bot');
  }
});

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
