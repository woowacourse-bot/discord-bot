const readyPermissions = async (client) => {
  console.log('채널', `Logged in as ${client.user.tag}!`);

  try {
    // '스스로 만들기' 카테고리의 ID를 확인합니다.
    const guild = client.guilds.cache.get(process.env.SERVER_ID); // 해당 서버의 ID를 넣어야 합니다.

    const limitedCategoriesIds = guild.channels.cache
      .filter((ch) => ch.name.includes('스스로 만들기'))
      .map((category) => category.id);

    if (!limitedCategoriesIds) {
      console.error("Category '스스로 만들기' not found.");
      return;
    }

    // '스스로 만들기' 카테고리에 속한 채널들을 가져옵니다.
    const channelsInCategory = guild.channels.cache.filter((ch) =>
      limitedCategoriesIds.includes(ch.parentId),
    );

    // refactor
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
};

export default readyPermissions;
