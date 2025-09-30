import { EmbedBuilder } from 'discord.js';
import MemberDao from '../../database/MemberDao.js';

/**
 * @param member
 */
export default async function guildMemberAddOnboarding(member) {
  try {
    // 봇은 제외
    if (member.user.bot) return;

    // 이미 인증된 회원인지 확인
    const existingMember = await MemberDao.findByDiscordId(member.user.id);
    if (existingMember) {
      console.log(`이미 인증된 회원이 재입장: ${member.user.username}`);

      // 이미 인증된 회원이면 역할 자동 부여
      const role = member.guild.roles.cache.get(process.env.ONBOARDING_ROLE_ID);
      if (role) {
        await member.roles.add(role);
        console.log(`기존 회원에게 역할 부여: ${member.user.username}`);
      }
      return;
    }

    // 새 회원 환영 메시지와 인증 안내
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#4ecdc4')
      .setTitle('🎉 우아한테크코스 프리코스에 오신 것을 환영합니다!')
      .setDescription(
        `안녕하세요 ${member.user.username}님!\n\n프리코스 참여를 위해 **회원 인증**이 필요합니다.\n 봇과의 DM 대화창에서 \`!인증\`을 입력해주세요.`,
      )
      .addFields(
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

    // DM으로 환영 메시지 발송
    try {
      await member.send({ embeds: [welcomeEmbed] });
      console.log(`신규 회원에게 DM 발송 완료: ${member.user.username}`);
    } catch (dmError) {
      console.log(`DM 발송 실패 (DM 차단된 듯): ${member.user.username}`);

      // DM 실패시 인증 채널에 멘션으로 안내 (단, '스스로만들기' 카테고리 하위 채널은 제외)
      const generalChannel = member.guild.channels.cache.find((channel) => {
        const inTarget = channel.name.includes('인증');
        const inSelfBuildCategory =
          channel.parent && channel.parent.name && channel.parent.name.includes('스스로만들기');
        return inTarget && !inSelfBuildCategory;
      });

      if (generalChannel) {
        const publicWelcomeEmbed = new EmbedBuilder()
          .setColor('#4ecdc4')
          .setTitle('신규 회원 인증 안내')
          .setDescription(
            `${member} 님, 현재 DM 수신이 차단되어 있어 안내를 보낼 수 없습니다.\n\n개인 설정 > 개인정보 보호에서 “서버 구성원으로부터의 DM 허용”을 켜주시거나, 봇과의 DM을 열어주세요.\nDM에서 \`!인증\`을 입력하면 인증이 절차가 시작됩니다.`,
          )
          .setTimestamp();

        await generalChannel.send({ embeds: [publicWelcomeEmbed] });
      }
    }
  } catch (error) {
    console.error('신규 회원 온보딩 처리 중 오류:', error);
  }
}
