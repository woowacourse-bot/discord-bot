const prefix = '!'; // 봇 명령어 접두사

const dice = (message) => {
  // 메시지가 봇의 메시지이거나 접두사를 가지고 있지 않으면 무시
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  // 명령어를 추출하고 공백을 기준으로 나눔
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 주사위 명령어를 처리
  if (command === '주사위') {
    // 1에서 100 사이의 랜덤한 숫자 생성
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    // 결과를 메시지로 보냄
    message.reply(`주사위 결과: ${randomNumber}`);
  }
};

export default dice;
