import MemberDao from '../../database/MemberDao.js';

/**
 * @param {import('discord.js').GuildMember} member
 */
export default async function guildMemberAddOnboarding(member) {
  try {
    // 봇은 제외
    if (member.user.bot) return;

    // 이미 인증된 회원인지 확인
    const existingMember = await MemberDao.findByDiscordId(member.user.id);
    if (existingMember) {
      // eslint-disable-next-line no-console
      console.log(`이미 인증된 회원이 재입장: ${member.user.username}`);

      // 이미 인증된 회원이면 역할 자동 부여
      const role = member.guild.roles.cache.get(process.env.ONBOARDING_ROLE_ID);
      if (role) {
        await member.roles.add(role);
        // eslint-disable-next-line no-console
        console.log(`기존 회원에게 역할 부여: ${member.user.username}`);
      }
      return;
    }

    // 신규 회원 입장 로그 (DM은 온보딩 완료 후 발송)
    // eslint-disable-next-line no-console
    console.log(`신규 회원 입장: ${member.user.username} (온보딩 완료 대기 중)`);

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('신규 회원 온보딩 처리 중 오류:', error);
  }
}
