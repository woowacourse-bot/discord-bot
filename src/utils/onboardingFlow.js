import MemberDao from '../database/MemberDao.js';

const QUESTIONS = [
  '안녕하세요! 새로 오신 분 환영합니다 🙌 이름을 입력해주세요.',
  '이메일도 입력해주세요. (예: name@example.com)',
];

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const runOnboardingFlow = async (user, memberOrGuild) => {
  const dm = await user.createDM();

  const ask = async (text) => {
    await dm.send(text);
    const collected = await dm.awaitMessages({
      max: 1,
      time: 20000,
      errors: ['time'],
      filter: (m) => m.author.id === user.id,
    }).catch(() => null);
    if (!collected) return null;
    return collected.first().content.trim();
  };

  const name = await ask(QUESTIONS[0]);
  if (!name) return { ok: false, reason: 'timeout' };

  const email = await ask(QUESTIONS[1]);
  if (!email) return { ok: false, reason: 'timeout' };

  if (!isValidEmail(email)) {
    await dm.send('이메일 형식이 올바르지 않습니다. 다시 시도해주세요.');
    return { ok: false, reason: 'email' };
  }

  const found = await MemberDao.findByNameEmail(name, email);
  if (!found) {
    await dm.send('등록된 회원 정보를 찾을 수 없어요. 운영진에게 문의해주세요.');
    return { ok: false, reason: 'not_found' };
  }

  const ok = await MemberDao.verifyAndBindDiscordId(found.id, user.id);
  if (!ok) {
    await dm.send('인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    return { ok: false, reason: 'db' };
  }

  const roleId = process.env.ONBOARDING_ROLE_ID;
  if (roleId && memberOrGuild) {
    const guild = memberOrGuild.guild || memberOrGuild;
    const member = memberOrGuild.guild ? memberOrGuild : await guild.members.fetch(user.id).catch(() => null);
    if (guild && member) {
      const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
      if (role) {
        await member.roles.add(role, 'Verified via DM onboarding');
      }
    }
  }

  await dm.send('인증이 완료되었습니다! 환영합니다. 필요한 채널 접근 권한이 부여되었습니다.');
  return { ok: true };
};

export default runOnboardingFlow;
