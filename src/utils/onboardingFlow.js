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

  // 총 2분 동안 이름/이메일 수집. 잘못 입력하면 즉시 재요청(처음부터 재시작 불필요)
  const collector = dm.createMessageCollector({
    filter: (m) => m.author.id === user.id,
    time: 120000,
    max: 5, // 재시도 포함 여유 있게 허용
  });

  let step = 1; // 1: 이름 수집, 2: 이메일 수집
  let name = '';
  let email = '';
  let foundMember = null; // 즉시 검증에서 조회한 멤버 캐시
  let invalidAttempts = 0;

  await retryWithBackoff(() => dm.send(QUESTIONS[0]));

  return new Promise((resolve) => {
    const triggerCooldownAndExit = async () => {
      const untilTs = Date.now() + COOLDOWN_MINUTES * 60000;
      cooldownUntilByUser.set(user.id, untilTs);
      await retryWithBackoff(() =>
        dm.send(
          `잘못된 입력이 ${MAX_INVALID_ATTEMPTS}회를 초과했습니다. 약 ${COOLDOWN_MINUTES}분 후에 DM에서 \`!인증\`을 다시 입력해 주세요.`,
        ),
      );
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
          await retryWithBackoff(() =>
            dm.send(
              `이름이 너무 짧습니다. 다시 입력해주세요. (남은 시도: ${
                MAX_INVALID_ATTEMPTS - invalidAttempts
              }회)`,
            ),
          );
          return;
        }
        // DB에 존재하는 이름인지 즉시 검증
        const exists = await MemberDao.findByName(content);
        if (!exists) {
          invalidAttempts += 1;
          if (invalidAttempts >= MAX_INVALID_ATTEMPTS) {
            await triggerCooldownAndExit();
            return;
          }
          await retryWithBackoff(() =>
            dm.send(
              `등록된 이름을 찾을 수 없습니다. 다시 입력해주세요. (남은 시도: ${
                MAX_INVALID_ATTEMPTS - invalidAttempts
              }회)`,
            ),
          );
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
          await retryWithBackoff(() =>
            dm.send(
              `이메일 형식이 올바르지 않습니다. 예: hong@example.com\n다시 입력해주세요. (남은 시도: ${
                MAX_INVALID_ATTEMPTS - invalidAttempts
              }회)`,
            ),
          );
          return; // 재입력 유도, 단계 유지
        }
        // 이름과 매칭되는 이메일인지 즉시 검증
        const match = await MemberDao.findByNameEmail(name, candidate);
        if (!match) {
          invalidAttempts += 1;
          if (invalidAttempts >= MAX_INVALID_ATTEMPTS) {
            await triggerCooldownAndExit();
            return;
          }
          await retryWithBackoff(() =>
            dm.send(
              `등록된 이름/이메일 조합을 찾을 수 없습니다. 이메일을 다시 입력해주세요. (남은 시도: ${
                MAX_INVALID_ATTEMPTS - invalidAttempts
              }회)`,
            ),
          );
          return; // 재입력 유도, 단계 유지
        }
        email = candidate;
        foundMember = match;

        // 수집 완료 → 검증 및 바인딩 진행 (이미 즉시 검증을 통과함)
        collector.stop();

        const ok = await MemberDao.verifyAndBindDiscordId(foundMember.id, user.id);
        if (!ok) {
          await retryWithBackoff(() =>
            dm.send(
              '인증 처리 중 일시적인 오류가 발생했습니다. 잠시 후 `!인증`을 다시 입력해 재시도해 주세요. (CODE: 99)',
            ),
          );
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
              try {
                await sleep(10 + Math.random() * 40);
                await retryWithBackoff(() => member.roles.add(role, 'Verified via DM onboarding'));
              } catch (roleError) {
                // 실패 기록 저장
                await RoleAssignmentFailureDao.create({
                  memberId: foundMember.id,
                  discordId: user.id,
                  roleId,
                  errorMessage: roleError?.message || 'Role assignment failed',
                }).catch(() => {});

                // 인증 채널 공지: 7기-운영진 카테고리의 인증공지 채널로 한정
                const authChannel = guild.channels.cache.find((channel) => {
                  const isTargetName = channel.name === '인증공지';
                  const inTargetCategory =
                    channel.parent && channel.parent.name === '7기-운영진';
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
            '✅ 인증이 완료되었습니다!. 이제 프리코스 서버에서 자유롭게 활동하실 수 있습니다.',
          ),
        );
        resolve({ ok: true });
      }
    });

    collector.on('end', async () => {
      if (!email && invalidAttempts < MAX_INVALID_ATTEMPTS) {
        await retryWithBackoff(() =>
          dm.send(
            '⏳ 입력 시간이 초과되었습니다. DM에서 `!인증`을 다시 입력해 처음부터 진행해 주세요.',
          ),
        );
        resolve({ ok: false, reason: 'timeout' });
      }
    });
  });
};

export default runOnboardingFlow;
