import MemberDao from '../database/MemberDao.js';

const QUESTIONS = [
  '안녕하세요! 새로 오신 분 환영합니다 🙌 이름을 입력해주세요.',
  '이메일도 입력해주세요. (예: name@example.com)',
];

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const runOnboardingFlow = async (user, memberOrGuild) => {
  const dm = await user.createDM();

  // DM에서 메시지 수집을 위한 컬렉터 생성
  const collector = dm.createMessageCollector({
    filter: (m) => m.author.id === user.id,
    time: 60000, // 총 1분 타임아웃
    max: 2, // 이름 + 이메일 2개
  });

  let step = 0;
  const answers = [];

  // 1단계: 이름 질문
  await dm.send(QUESTIONS[0]);

  return new Promise((resolve) => {
    collector.on('collect', async (message) => {
      const content = message.content.trim();
      answers.push(content);
      step += 1;

      if (step === 1) {
        // 2단계: 이메일 질문
        await dm.send(QUESTIONS[1]);
      } else if (step === 2) {
        // 모든 답변 수집 완료
        collector.stop();

        const [name, email] = answers;

        if (!isValidEmail(email)) {
          await dm.send('이메일 형식이 올바르지 않습니다. 다시 시도해주세요.');
          resolve({ ok: false, reason: 'email' });
          return;
        }

        const found = await MemberDao.findByNameEmail(name, email);
        if (!found) {
          await dm.send('등록된 회원 정보를 찾을 수 없어요. 운영진에게 문의해주세요.');
          resolve({ ok: false, reason: 'not_found' });
          return;
        }

        const ok = await MemberDao.verifyAndBindDiscordId(found.id, user.id);
        if (!ok) {
          await dm.send('인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          resolve({ ok: false, reason: 'db' });
          return;
        }

        // 역할 부여
        const roleId = process.env.ONBOARDING_ROLE_ID;
        if (roleId && memberOrGuild) {
          const guild = memberOrGuild.guild || memberOrGuild;
          const member = memberOrGuild.guild
            ? memberOrGuild
            : await guild.members.fetch(user.id).catch(() => null);
          if (guild && member) {
            const role =
              guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId).catch(() => null));
            if (role) {
              await member.roles.add(role, 'Verified via DM onboarding');
            }
          }
        }

        await dm.send('인증이 완료되었습니다! 환영합니다. 필요한 채널 접근 권한이 부여되었습니다.');
        resolve({ ok: true });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size < 2) {
        await dm.send('입력 시간이 초과되었습니다. DM에서 `!인증`을 다시 입력해주세요.');
        resolve({ ok: false, reason: 'timeout' });
      }
    });
  });
};

export default runOnboardingFlow;
