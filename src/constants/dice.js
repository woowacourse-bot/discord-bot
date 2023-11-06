export const DICE_COMMAND = '주사위';

export const DICE_NUMBER_RANGE = Object.freeze({
  min: 1,
  max: 100,
});

// 특정 숫자에 대한 코멘트를 key & value로 추가합니다.
export const DICE_COMMENT_DATA = Object.freeze({
  1: '무승부로 하지 않을래...? ',
  3: '주사위는 완전 잘못이 없습니다.',
  4: '독일에서는 4가 행운의 숫자래요...!',
  10: '오늘도 화이팅!',
  9: '한 자리 숫자라니...',
  77: '운이 정말 좋으신데요? 로또라도 사러 가 보시는건 어떤가요?',
  100: '디스코드 봇이 당신의 하루를 보증합니다!!',
});
