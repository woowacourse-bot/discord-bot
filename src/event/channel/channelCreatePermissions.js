const channelCreatePermissions = async (channel, client) => {
  try {
    // 채널을 만든 사용자의 정보를 가져옵니다.
    const logs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 10,
    });

    const guild = client.guilds.cache.get(process.env.SERVER_ID);
    const selectedCategoriesIds = guild.channels.cache
      .filter((category) => category.name.includes('스스로 만들기'))
      .map((category) => category.id);

    const { id: creatorId, displayName: creatorNickname } = logs.entries.first().executor;
    const creator = await channel.guild.members.fetch(creatorId);

    if (!selectedCategoriesIds.includes(channel.parentId)) {
      console.log(`\n스스로 만들기가 아닌 채널 생성됨.`);
      console.log(`채널명: ${channel.name}`);
      console.log(`생성 유저: ${creatorNickname}`);
      console.log(`생성 시각: ${new Date()}`);
      return;
    }

    console.log(`\n스스로 만들기 채널 생성됨.`);
    console.log(`채널명: ${channel.name}`);
    console.log(`생성 유저: ${creatorNickname}`);
    console.log(`생성 시각: ${new Date()}`);

    // 생성자에게만 'MANAGE_CHANNELS' 권한 부여
    await channel.permissionOverwrites.edit(creator.id, {
      ManageChannels: true,
    });

    // @everyone에 대한 'MANAGE_CHANNELS' 권한 제거
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      ManageChannels: false,
    });

    // 특정 역할에 대한 권한 제거 (역할 ID로 직접 접근)
    const specificRole = channel.guild.roles.cache.get('1422476606202445845');
    console.log(
      `역할 찾기 결과:`,
      specificRole ? `찾음 - ${specificRole.name}` : '찾을 수 없음',
    );

    if (specificRole) {
      try {
        await channel.permissionOverwrites.edit(specificRole, {
          ManageChannels: false,
        });
        console.log(`✅ 채널 ${channel.name}에서 역할 ${specificRole.name}의 권한 제거 완료`);
      } catch (error) {
        console.error(`❌ 권한 제거 실패:`, error.message);
      }
    }

    console.log(`\n권한 수정 완료됨.`);
    console.log(`권한 수정 채널명: ${channel.name}`);
    console.log(`수정 시각: ${new Date()}`);
  } catch (error) {
    console.error('Error setting permissions:', error);
  }
};

export default channelCreatePermissions;
