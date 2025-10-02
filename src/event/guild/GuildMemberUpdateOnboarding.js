import { EmbedBuilder } from 'discord.js';
import { retryWithBackoff } from '../../utils/retry.js';

/**
 * Discord 온보딩 완료 시 DM 발송
 * @param {import('discord.js').GuildMember} oldMember
 * @param {import('discord.js').GuildMember} newMember
 */
export default async function guildMemberUpdateOnboarding(oldMember, newMember) {
  try {
    // 봇은 제외
    if (newMember.user.bot) return;

    // 디버깅: 모든 guildMemberUpdate 이벤트 로그
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] GuildMemberUpdate: ${newMember.user.username} - pending: ${oldMember.pending} → ${newMember.pending}`);

    // pending 상태가 true에서 false로 변경된 경우 (온보딩 완료)
    if (oldMember.pending && !newMember.pending) {
      // eslint-disable-next-line no-console
      console.log(`온보딩 완료: ${newMember.user.username}`);

      // 온보딩 완료 축하 메시지
      const onboardingCompleteEmbed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle('🎉 온보딩을 완료하셨습니다!')
        .setDescription(
          `${newMember.user.username}님, 서버 온보딩을 완료해주셔서 감사합니다!\n\n이제 **회원 인증**을 진행해주세요.`,
        )
        .addFields(
          {
            name: '🔐 회원 인증 방법',
            value: '이 DM 대화창에서 `!인증`을 입력해주세요.',
            inline: false,
          },
          {
            name: '📝 인증 절차',
            value:
              '1️⃣ 지원하실 때 입력하신 본명 입력\n2️⃣ 지원하실 때 입력하신 이메일 입력\n3️⃣ 역할 자동 부여',
            inline: false,
          },
          {
            name: '❓ 문의사항',
            value: '인증 과정에서 문제가 있으시면 문의하기 채널에서 문의해주세요.',
            inline: false,
          },
        )
        .setFooter({ text: '인증 후 허용된 모든 채널에 접근하실 수 있습니다.' })
        .setTimestamp();

      // DM으로 메시지 발송
      try {
        await retryWithBackoff(() => newMember.send({ embeds: [onboardingCompleteEmbed] }));
        // eslint-disable-next-line no-console
        console.log(`온보딩 완료 DM 발송 완료: ${newMember.user.username}`);
      } catch (dmError) {
        // eslint-disable-next-line no-console
        console.log(`온보딩 완료 DM 발송 실패 (DM 차단된 듯): ${newMember.user.username}`);

        // DM 실패시 인증 채널에 멘션으로 안내 (7기-운영진/인증공지)
        const generalChannel = newMember.guild.channels.cache.find((channel) => {
          const isTargetName = channel.name === '인증';
          const inTargetCategory = channel.parent && channel.parent.name !== '스스로 만들기';
          return isTargetName && inTargetCategory && channel.isTextBased();
        });

        if (generalChannel) {
          const publicWelcomeEmbed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('신규 회원 인증 안내')
            .setDescription(
              `${newMember} 님, 현재 DM 수신이 차단되어 있어 안내를 보낼 수 없습니다.\n\n개인 설정 > 개인정보 보호에서 "서버 구성원으로부터의 DM 허용"을 켜주시거나, 봇과의 DM을 열어주세요.\nDM에서 \`!인증\`을 입력하면 인증 절차가 시작됩니다.`,
            )
            .setTimestamp();

          await retryWithBackoff(() =>
            generalChannel.send({ embeds: [publicWelcomeEmbed] }),
          ).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('인증 채널 메시지 발송 실패:', err);
          });
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('온보딩 완료 처리 중 오류:', error);
  }
}

