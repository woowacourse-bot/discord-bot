const channelCreatePermissions = async (channel, client) => {
  try {
    const guild = client.guilds.cache.get(process.env.SERVER_ID);
    const category = guild.channels.cache.find((ch) => ch.name === '스스로 만들기');
    if (channel.parentId !== category.id) {
      console.log(`스스로 만들기가 아닌 채널 생성됨. (채널명: ${channel.name}) ${new Date()}`);
      return;
    }

    console.log(`스스로 만들기에 채널 생성됨. (채널명: ${channel.name} ${new Date()}`);

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

    console.log(`권한 수정 완료됨. (채널명: ${channel.name} ${new Date()}`);
  } catch (error) {
    console.error('Error setting permissions:', error);
  }
};

export default channelCreatePermissions;
