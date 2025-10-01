/* eslint-disable no-console */
import { EmbedBuilder } from 'discord.js';
import RoleAssignmentFailureDao from '../database/RoleAssignmentFailureDao.js';
import { retryWithBackoff } from './retry.js';

/**
 * 역할 부여 실패자를 인증 채널에 공지하고 재시도
 * @param {import('discord.js').Client} client - Discord 클라이언트
 * @returns {Promise<void>}
 */
export default async function notifyRoleFailures(client) {
  try {
    const failures = await RoleAssignmentFailureDao.findUnnotified(50);
    if (failures.length === 0) return;

    const guild = await client.guilds.fetch(process.env.SERVER_ID);
    if (!guild) {
      console.error('서버를 찾을 수 없습니다:', process.env.SERVER_ID);
      return;
    }

    // 인증 채널 찾기 (스스로만들기 카테고리 제외)
    const authChannel = guild.channels.cache.find((channel) => {
      const isAuthChannel = channel.name.includes('인증');
      const inSelfBuildCategory =
        channel.parent && channel.parent.name && channel.parent.name.includes('스스로만들기');
      return isAuthChannel && !inSelfBuildCategory && channel.isTextBased();
    });

    if (!authChannel) {
      console.error('인증 채널을 찾을 수 없습니다.');
      return;
    }

    const successIds = [];

    // Promise.all을 사용하여 병렬 처리
    const results = await Promise.allSettled(
      failures.map(async (failure) => {
        try {
          // 역할 부여 재시도
          const member = await guild.members.fetch(failure.discordId).catch(() => null);
          const role = await guild.roles.fetch(failure.roleId).catch(() => null);

          if (member && role) {
            await retryWithBackoff(() => member.roles.add(role, 'Retry role assignment'));
            console.log(`[ROLE_SUCCESS] 역할 부여 성공: ${failure.discordId} (재시도)`);
            return { success: true, id: failure.id };
          } 
            // 역할 부여 실패 공지
            const embed = new EmbedBuilder()
              .setColor('#ff6b6b')
              .setTitle('⚠️ 역할 부여 실패 알림')
              .setDescription(
                `<@${failure.discordId}> 님의 인증은 완료되었으나 역할 부여에 실패했습니다.`,
              )
              .addFields(
                { name: '이름', value: failure.name || '알 수 없음', inline: true },
                { name: '이메일', value: failure.email || '알 수 없음', inline: true },
                { name: '재시도 횟수', value: `${failure.retryCount}회`, inline: true },
                { name: '오류 사유', value: failure.reason || 'Unknown', inline: false },
              )
              .setFooter({ text: '운영진이 수동으로 역할을 부여해주세요.' })
              .setTimestamp(new Date(failure.createdAt));

            await authChannel.send({ embeds: [embed] });
            return { success: false, id: failure.id };
          
        } catch (error) {
          console.error(`[ROLE_FAIL] 재시도 실패: ${failure.discordId}`, error);
          return { success: false, id: failure.id };
        }
      }),
    );

    // 성공한 건들만 수집
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successIds.push(result.value.id);
      }
    });

    // 성공한 건은 DB에서 삭제
    if (successIds.length > 0) {
      await RoleAssignmentFailureDao.deleteByIds(successIds);
      console.log(`[ROLE_FAIL] ${successIds.length}건 재시도 성공 및 삭제 완료`);
    }
  } catch (error) {
    console.error('역할 부여 실패 처리 중 오류:', error);
  }
}

