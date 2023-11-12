import { MESSAGE_PREFIX } from '../../constants/config.js';
import {
  APPLICATION_FIELD,
  DELIMITER,
  FIELD,
  MISSION,
  MISSION_ENGLISH,
  NAME,
} from '../../constants/pr.js';

const createCommand = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  return args.shift().toLowerCase();
};

const isValidMission = (command) => {
  const { lotto, baseball, racingcar, christmas } = MISSION;

  return (
    command.startsWith(lotto) ||
    command.startsWith(baseball) ||
    command.startsWith(racingcar) ||
    command.startsWith(christmas)
  );
};

const isValidApplicationField = (field) => {
  const { frontend, backend, android } = APPLICATION_FIELD;

  return field === frontend || field === backend || field === android;
};

const getRepositoryLink = (field, mission) =>
  `https://github.com/woowacourse-precourse/${FIELD[field]}-${MISSION_ENGLISH[mission]}-6`;

const isValidName = (name) => {
  const isValidLength = name.length > NAME.minLength && name.length < NAME.maxLength;
  const koreanPattern = '[^가-힣]';
  const regexp = new RegExp(koreanPattern, 'g');
  const isKorean = !regexp.test(name);

  return isValidLength && isKorean;
};

const getPrLink = (field, mission, name) =>
  `https://github.com/woowacourse-precourse/${FIELD[field]}-${MISSION_ENGLISH[mission]}-6/pulls?q=is%3Apr+is%3Aopen+in%3Atitle+${name}`;

const pr = (message) => {
  // 메시지가 봇의 메시지이거나 접두사를 가지고 있지 않으면 무시
  if (message.author.bot || !message.content.startsWith(MESSAGE_PREFIX)) return;

  // 명령어를 추출하고 공백을 기준으로 나눔
  const command = createCommand(message, MESSAGE_PREFIX);

  if (!isValidMission(command)) return;

  const prInfo = command.split(DELIMITER);

  if (prInfo.length > 3) return;

  const [mission, field, name] = prInfo;

  if (!isValidApplicationField(field)) return;

  if (!name) {
    message.reply(getRepositoryLink(field, mission));
    return;
  }

  if (!isValidName(name)) return;

  message.reply(getPrLink(field, mission, name));
};

export default pr;
