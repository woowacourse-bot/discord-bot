import { EmbedBuilder } from 'discord.js';
import runOnboardingFlow from '../../utils/onboardingFlow.js';
import MemberDao from '../../database/MemberDao.js';

/**
 *
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
      .setDescription(`안녕하세요 ${member.user.username}님!\n\n프리코스 참여를 위해 **회원 인증**이 필요합니다.\n아래 버튼을 클릭하거나 \`!인증\` 명령어를 입력해주세요.`)
      .addFields(
        { 
          name: '📝 인증 절차', 
          value: '1️⃣ 본명 입력\n2️⃣ 우아한테크코스 이메일 입력\n3️⃣ 역할 자동 부여', 
          inline: false 
        },
        { 
          name: '❓ 문의사항', 
          value: '인증 과정에서 문제가 있으시면 관리자에게 문의해주세요.', 
          inline: false 
        }
      )
      .setFooter({ text: '인증 후 모든 채널에 접근하실 수 있습니다.' })
      .setTimestamp();

    // DM으로 환영 메시지 발송
    try {
      await member.send({ embeds: [welcomeEmbed] });
      console.log(`신규 회원에게 DM 발송 완료: ${member.user.username}`);

      // DM 환영 후 바로 온보딩 시작 (1단계 질문 진행)
      await runOnboardingFlow(member.user, member);
    } catch (dmError) {
      console.log(`DM 발송 실패 (DM 차단된 듯): ${member.user.username}`);
      
      // DM 실패시 서버 채널에 멘션으로 안내
      const generalChannel = member.guild.channels.cache.find(
        channel => channel.name.includes('일반') || 
                  channel.name.includes('general') || 
                  channel.name.includes('welcome')
      );
      
      if (generalChannel) {
        const publicWelcomeEmbed = new EmbedBuilder()
          .setColor('#4ecdc4')
          .setTitle('신규 회원 인증 안내')
          .setDescription(`${member} 님, 프리코스 참여를 위해 \`!인증\` 명령어를 입력해주세요!`)
          .setTimestamp();
        
        await generalChannel.send({ embeds: [publicWelcomeEmbed] });
      }
    }

  } catch (error) {
    console.error('신규 회원 온보딩 처리 중 오류:', error);
  }
}
