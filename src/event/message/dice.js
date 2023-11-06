import { MESSAGE_PREFIX } from '../../constants/config.js';
import { DICE_COMMAND, DICE_NUMBER_RANGE } from '../../constants/dice.js';

const createCommand = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  return args.shift().toLowerCase();
};

const dice = (message) => {
  // 메시지가 봇의 메시지이거나 접두사를 가지고 있지 않으면 무시
  if (message.author.bot || !message.content.startsWith(MESSAGE_PREFIX)) return;

  // 명령어를 추출하고 공백을 기준으로 나눔
  const command = createCommand(message, MESSAGE_PREFIX);

  // 주사위 명령어를 처리
  if (command === DICE_COMMAND) {
    // 1에서 100 사이의 랜덤한 숫자 생성
    const randomNumber = Math.floor(Math.random() * DICE_NUMBER_RANGE.max) + DICE_NUMBER_RANGE.min;

    // 결과를 메시지로 보냄
    message.reply(`주사위 결과: ${randomNumber}`);
  }
};

export default dice;
