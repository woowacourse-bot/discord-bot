import { EmbedBuilder } from 'discord.js';
import MemberDao from '../../database/MemberDao.js';
import runOnboardingFlow from '../../utils/onboardingFlow.js';

/**
 *
 * @param message
 */
/**
 * DM 전용 인증 명령 처리. 마지막에 길드 역할 부여까지 수행.
 * @param {import('discord.js').Message} message
 * @returns {Promise<void>}
 */
export default async function verify(message) {
  if (!message.content.startsWith('!인증')) {
    return undefined;
  }

  // 길드 채널에서 호출되면 DM으로 안내
  if (message.guild) {
    const dmGuide = new EmbedBuilder()
      .setColor('#ffa726')
      .setTitle('인증 안내')
      .setDescription(
        '이 명령은 DM에서만 진행됩니다. 봇과의 DM 대화창에서 `!인증`을 입력해 주세요.',
      )
      .setTimestamp();
    await message.reply({ embeds: [dmGuide] });
    return undefined;
  }

  try {
    // DM에서 명령 수신 즉시 안내 (이벤트 유입 확인용)
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#4ecdc4')
          .setTitle('인증 시작')
          .setDescription(
            '지원하실 때 입력하신 이름과 이메일을 순서대로 여쭤볼게요. 각 단계는 20초 내에 응답해주세요.',
          )
          .setTimestamp(),
      ],
    });
    // eslint-disable-next-line no-console
    console.log('[VERIFY][DM] command received', {
      userId: message.author.id,
      content: message.content,
    });

    // DM 컨텍스트: 먼저 이미 인증된 회원인지 확인
    const existing = await MemberDao.findByDiscordId(message.author.id);
    if (existing && existing.verified) {
      const already = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle('이미 인증 완료')
        .setDescription('이미 인증된 계정입니다. 역할을 다시 확인합니다...')
        .setTimestamp();
      await message.reply({ embeds: [already] });

      // 역할 보정: 서버 컨텍스트를 직접 가져와 확인/부여
      const guild = await message.client.guilds.fetch(process.env.SERVER_ID);
      const member = await guild.members.fetch(message.author.id).catch(() => null);
      const role = process.env.ONBOARDING_ROLE_ID
        ? guild.roles.cache.get(process.env.ONBOARDING_ROLE_ID) ||
          (await guild.roles.fetch(process.env.ONBOARDING_ROLE_ID).catch(() => null))
        : null;
      if (member && role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role, 'Verified user role reconciliation');
      }
      return undefined;
    }

    // 길드 컨텍스트 준비 후 DM 온보딩 플로우 실행(이름/이메일 수집은 DM에서 처리)
    const guild = await message.client.guilds.fetch(process.env.SERVER_ID);
    await runOnboardingFlow(message.author, guild);
  } catch (e) {
    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle('인증 오류')
      .setDescription('인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }

  return undefined;
}
