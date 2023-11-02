# woowacourse-discord-bot contribute guide

이 문서는 우아한테크코스 디스코드 봇에 기여하시는 분들을 위한 가이드입니다.

# ✨ 기여하기

디스코드 봇에 기여해 주신 모든 분께 감사드립니다.

1. 이 레포지토리를 Fork하고, 브랜치를 생성한 후, 디스코드 봇을 실행합니다.
2. 디스코드 내 채널을 생성 한 후 봇을 자유롭게 사용하며, 발생하는 이슈 들을 체크합니다.
3. 만약 디스코드 봇에 문제가 있거나 필요한 기능들에 대해선 [GitHub Issues](https://github.com/woowacourse-bot/discord-bot/issues)를 통해 템플릿 양식에 맞춰 이슈를 상세히 기록합니다.
4. 이슈를 등록했다면, 해당 이슈에 대해 commit - push 후 pull request를 진행합니다.
5. pull request가 등록되면 메인테이너가 이슈 들을 점검 후 해결 방법이 잘 동작하는지 테스트를 진행합니다.
6. 깔끔하게 동작한다면 메인테이너가 브랜치를 병합합니다. 감사합니다! 🎉

# 🤝 컨벤션

## PR 및 커밋 타이틀

PR과 커밋 타이틀은 [Angular.js 커밋 메시지 컨벤션](https://gist.github.com/stephenparish/9941e89d80e2bc58a153)을 기반으로 합니다:

```
<type>(<scope>): <short summary>
```

- **type**: 커밋의 타입을 나타냅니다.
  - `docs`: 문서 수정
  - `feat`: 새로운 기능 추가
  - `fix`: 버그 수정
  - `style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
  - `refactor`: 코드 리팩토링
  - `test`: 테스트 코드, 리팩토링 테스트 코드 추가
  - `chore`: 빌드 및 패키지 매니저 수정
- **scope**: 커밋의 범위를 나타냅니다. (선택사항)
- **subject**: 커밋의 제목을 나타냅니다.

## PR 규칙

- 논의가 필요한 PR은 수정 요청을 할 수 있습니다.
- PR 생성 시 체크리스트를 확인해주세요.

## 코드 컨벤션

전체적인 코드 컨벤션의 경우 [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)을 기반으로 합니다.
