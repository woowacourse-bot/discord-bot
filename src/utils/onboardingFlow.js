import MemberDao from '../database/MemberDao.js';
import { sleep, retryWithBackoff } from './retry.js';

const QUESTIONS = [
  '1단계) 본명을 입력해주세요. 예: 홍길동',
  '2단계) 지원 시 제출하신 이메일을 입력해주세요. 예: hong@example.com',
];

const isValidEmail = (email) => /.+@.+\..+/.test(email);

// 간단 쿨다운(메모리). 프로세스 재시작 시 초기화됩니다.
const cooldownUntilByUser = new Map(); // userId -> timestamp(ms)
const COOLDOWN_MINUTES = 10;
const MAX_INVALID_ATTEMPTS = 5;

const runOnboardingFlow = async (user, memberOrGuild) => {
  const now = Date.now();
  const until = cooldownUntilByUser.get(user.id) || 0;
  if (until > now) {
    const remainingMs = until - now;
    const remainingMin = Math.ceil(remainingMs / 60000);
    const dmEarly = await user.createDM();
    await retryWithBackoff(() => dmEarly.send(`최근 여러 번 잘못된 입력이 감지되어 일시적으로 인증이 제한되었습니다. 약 ${remainingMin}분 후에 다시 시도해주세요.`));
    return { ok: false, reason: 'cooldown' };
  }

  const dm = await user.createDM();

  // 총 2분 동안 이름/이메일 수집. 잘못 입력하면 즉시 재요청(처음부터 재시작 불필요)
  const collector = dm.createMessageCollector({
    filter: (m) => m.author.id === user.id,
    time: 120000,
    max: 5, // 재시도 포함 여유 있게 허용
  });

  let step = 1; // 1: 이름 수집, 2: 이메일 수집
  let name = '';
  let email = '';
  let invalidAttempts = 0;

  await retryWithBackoff(() => dm.send(QUESTIONS[0]));

  return new Promise((resolve) => {
    const triggerCooldownAndExit = async () => {
      const untilTs = Date.now() + COOLDOWN_MINUTES * 60000;
      cooldownUntilByUser.set(user.id, untilTs);
      await retryWithBackoff(() => dm.send(`잘못된 입력이 ${MAX_INVALID_ATTEMPTS}회를 초과했습니다. 약 ${COOLDOWN_MINUTES}분 후에 DM에서 \`!인증\`을 다시 입력해 주세요.`));
      collector.stop();
      resolve({ ok: false, reason: 'cooldown' });
    };

    collector.on('collect', async (message) => {
      const content = message.content.trim();

      // 이름 단계
      if (step === 1) {
        if (content.length < 2) {
          invalidAttempts += 1;
          if (invalidAttempts >= MAX_INVALID_ATTEMPTS) {
            await triggerCooldownAndExit();
            return;
          }
          await retryWithBackoff(() => dm.send(`이름이 너무 짧습니다. 다시 입력해주세요. (남은 시도: ${MAX_INVALID_ATTEMPTS - invalidAttempts}회)`));
          return;
        }
        name = content;
        step = 2;
        await retryWithBackoff(() => dm.send(QUESTIONS[1]));
        return;
      }

      // 이메일 단계
      if (step === 2) {
        const candidate = content.toLowerCase();
        if (!isValidEmail(candidate)) {
          invalidAttempts += 1;
          if (invalidAttempts >= MAX_INVALID_ATTEMPTS) {
            await triggerCooldownAndExit();
            return;
          }
          await retryWithBackoff(() => dm.send(`이메일 형식이 올바르지 않습니다. 예: hong@example.com\n다시 입력해주세요. (남은 시도: ${MAX_INVALID_ATTEMPTS - invalidAttempts}회)`));
          return; // 재입력 유도, 단계 유지
        }
        email = candidate;

        // 수집 완료 → 검증 및 바인딩 진행
        collector.stop();

        const found = await MemberDao.findByNameEmail(name, email);
        if (!found) {
          await retryWithBackoff(() => dm.send('등록된 이름/이메일을 찾을 수 없어요. 입력값을 다시 확인하시거나 운영진에게 문의해 주세요.'));
          resolve({ ok: false, reason: 'not_found' });
          return;
        }

        const ok = await MemberDao.verifyAndBindDiscordId(found.id, user.id);
        if (!ok) {
          await retryWithBackoff(() => dm.send('인증 처리 중 일시적인 오류가 발생했습니다. 잠시 후 `!인증`을 다시 입력해 재시도해 주세요. (CODE: 99)'));
          resolve({ ok: false, reason: 'db' });
          return;
        }

        // 역할 부여
        const roleId = process.env.ONBOARDING_ROLE_ID;
        if (roleId && memberOrGuild) {
          const guild = memberOrGuild.guild || memberOrGuild;
          const member = memberOrGuild.guild ? memberOrGuild : await guild.members.fetch(user.id).catch(() => null);
          if (guild && member) {
            const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
            if (role) {
              await sleep(10 + Math.random() * 40);
              await retryWithBackoff(() => member.roles.add(role, 'Verified via DM onboarding'));
            }
          }
        }

        await retryWithBackoff(() => dm.send('✅ 인증이 완료되었습니다! 잠시 후 서버에서 필요한 역할이 부여됩니다. 환영합니다.'));
        resolve({ ok: true });
      }
    });

    collector.on('end', async () => {
      if (!email && invalidAttempts < MAX_INVALID_ATTEMPTS) {
        await retryWithBackoff(() => dm.send('⏳ 입력 시간이 초과되었습니다. DM에서 `!인증`을 다시 입력해 처음부터 진행해 주세요.'));
        resolve({ ok: false, reason: 'timeout' });
      }
    });
  });
};

export default runOnboardingFlow;
