import { EmbedBuilder } from 'discord.js';
import MemberDao from '../database/MemberDao.js';
import RoleAssignmentFailureDao from '../database/RoleAssignmentFailureDao.js';
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
    await retryWithBackoff(() =>
      dmEarly.send(
        `최근 여러 번 잘못된 입력이 감지되어 일시적으로 인증이 제한되었습니다. 약 ${remainingMin}분 후에 다시 시도해주세요.`,
      ),
    );
    return { ok: false, reason: 'cooldown' };
  }

  const dm = await user.createDM();

  let name = '';
  let foundMember = null; // 즉시 검증에서 조회한 멤버 캐시
  let invalidAttempts = 0;

  // 쿨다운 트리거
  const triggerCooldownAndExit = async () => {
    const untilTs = Date.now() + COOLDOWN_MINUTES * 60000;
    cooldownUntilByUser.set(user.id, untilTs);
    await retryWithBackoff(() =>
      dm.send(
        `잘못된 입력이 ${MAX_INVALID_ATTEMPTS}회를 초과했습니다. 약 ${COOLDOWN_MINUTES}분 후에 DM에서 \`!인증\`을 다시 입력해 주세요.`,
      ),
    );
    return { ok: false, reason: 'cooldown' };
  };

  // 단계별 20초 타임아웃 수집 함수
  const awaitOneMessage = async () => {
    const collected = await dm
      .awaitMessages({
        filter: (m) => m.author.id === user.id,
        max: 1,
        time: 20000,
        errors: ['time'],
      })
      .catch(() => null);
    if (!collected || collected.size === 0) return null;
    return collected.first().content.trim();
  };

  // 1) 이름 단계
  await retryWithBackoff(() => dm.send(QUESTIONS[0]));
  /* eslint-disable no-await-in-loop, no-constant-condition, no-continue, no-loop-func, no-return-await */
  while (true) {
    const content = await awaitOneMessage();
    if (content === null) {
      await retryWithBackoff(() =>
        dm.send(
          '⏳ 입력 시간이 초과되었습니다. DM에서 `!인증`을 다시 입력해 처음부터 진행해 주세요.',
        ),
      );
      return { ok: false, reason: 'timeout_name' };
    }

    if (content.length < 2) {
      invalidAttempts += 1;
      if (invalidAttempts >= MAX_INVALID_ATTEMPTS) return await triggerCooldownAndExit();
      await retryWithBackoff(() =>
        dm.send(
          `이름이 너무 짧습니다. 다시 입력해주세요. (남은 시도: ${
            MAX_INVALID_ATTEMPTS - invalidAttempts
          }회)`,
        ),
      );
      continue;
    }

    const exists = await MemberDao.findByName(content);
    if (!exists) {
      invalidAttempts += 1;
      if (invalidAttempts >= MAX_INVALID_ATTEMPTS) return await triggerCooldownAndExit();
      await retryWithBackoff(() =>
        dm.send(
          `등록된 이름을 찾을 수 없습니다. 다시 입력해주세요. (남은 시도: ${
            MAX_INVALID_ATTEMPTS - invalidAttempts
          }회)`,
        ),
      );
      continue;
    }
    name = content;
    break;
  }
  /* eslint-enable no-await-in-loop, no-constant-condition, no-continue, no-loop-func, no-return-await */

  // 2) 이메일 단계
  await retryWithBackoff(() => dm.send(QUESTIONS[1]));
  /* eslint-disable no-await-in-loop, no-constant-condition, no-continue, no-loop-func, no-return-await */
  while (true) {
    const content = await awaitOneMessage();
    if (content === null) {
      await retryWithBackoff(() =>
        dm.send(
          '⏳ 입력 시간이 초과되었습니다. DM에서 `!인증`을 다시 입력해 처음부터 진행해 주세요.',
        ),
      );
      return { ok: false, reason: 'timeout_email' };
    }

    const candidate = content.toLowerCase();
    if (!isValidEmail(candidate)) {
      invalidAttempts += 1;
      if (invalidAttempts >= MAX_INVALID_ATTEMPTS) return await triggerCooldownAndExit();
      await retryWithBackoff(() =>
        dm.send(
          `이메일 형식이 올바르지 않습니다. 예: hong@example.com\n다시 입력해주세요. (남은 시도: ${
            MAX_INVALID_ATTEMPTS - invalidAttempts
          }회)`,
        ),
      );
      continue;
    }

    const match = await MemberDao.findByNameEmail(name, candidate);
    if (!match) {
      invalidAttempts += 1;
      if (invalidAttempts >= MAX_INVALID_ATTEMPTS) return await triggerCooldownAndExit();
      await retryWithBackoff(() =>
        dm.send(
          `등록된 이름/이메일 조합을 찾을 수 없습니다. 이메일을 다시 입력해주세요. (남은 시도: ${
            MAX_INVALID_ATTEMPTS - invalidAttempts
          }회)`,
        ),
      );
      continue;
    }
    foundMember = match;
    break;
  }
  /* eslint-enable no-await-in-loop, no-constant-condition, no-continue, no-loop-func, no-return-await */

  // 바인딩 처리
  const ok = await MemberDao.verifyAndBindDiscordId(foundMember.id, user.id);
  if (!ok) {
    await retryWithBackoff(() =>
      dm.send(
        '인증 처리 중 일시적인 오류가 발생했습니다. 잠시 후 `!인증`을 다시 입력해 재시도해 주세요. (CODE: 99)',
      ),
    );
    return { ok: false, reason: 'db' };
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
        try {
          await sleep(10 + Math.random() * 40);
          await retryWithBackoff(() => member.roles.add(role, 'Verified via DM onboarding'));
        } catch (roleError) {
          await RoleAssignmentFailureDao.create({
            memberId: foundMember.id,
            discordId: user.id,
            roleId,
            errorMessage: roleError?.message || 'Role assignment failed',
          }).catch(() => {});

          const authChannel = guild.channels.cache.find((channel) => {
            const isTargetName = channel.name === '인증공지';
            const inTargetCategory = channel.parent && channel.parent.name === '7기-운영진';
            return isTargetName && inTargetCategory && channel.isTextBased();
          });

          if (authChannel) {
            const embed = new EmbedBuilder()
              .setColor('#ff6b6b')
              .setTitle('⚠️ 역할 부여 실패 알림')
              .setDescription(
                `<@${user.id}> 님의 인증은 완료되었으나 역할 부여에 실패했습니다. 운영진 확인이 필요합니다.`,
              )
              .addFields(
                { name: '이름', value: foundMember.name || '알 수 없음', inline: true },
                { name: '이메일', value: foundMember.email || '알 수 없음', inline: true },
                { name: '역할 ID', value: roleId, inline: true },
              )
              .setTimestamp();

            await authChannel.send({ embeds: [embed] }).catch(() => {});
          }
        }
      }
    }
  }

  await retryWithBackoff(() =>
    dm.send(
      '✅ 인증이 완료되었습니다!. 지원자 역할이 부여됐습니다. 이제 프리코스 서버에서 자유롭게 활동하실 수 있습니다.',
    ),
  );
  return { ok: true };
};

export default runOnboardingFlow;
