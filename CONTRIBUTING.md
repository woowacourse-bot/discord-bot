# woowacourse-discord-bot contribute guide

이 문서는 우아한테크코스 디스코드 봇에 기여하시는 분들을 위한 가이드입니다.

## 🚀 시작하기

이 프로젝트는 [Node.js](https://nodejs.org/ko) 및 [npm](https://www.npmjs.com/)을 이용합니다.

## 디스코드 봇 생성

**[Discord Developer Portal](https://discord.com/developers/applications)에 접속하여 디스코드 봇을 생성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/cebba5ec-d188-4dd6-a7b8-fd86562b607d"/>

**생성할 봇의 이름을 작성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/9e8ee0c0-8a65-43e9-b4cd-94f11f26b87f"/>

## 디스코드 봇 퍼미션 설정

**`OAuth2` 항목에 `URL Generator`에서 `Scopes`의 `Bot`을 체크한 후 `Bot Permissions`에서 `Administrator`를 체크 한 후 생성된 url에 접속합니다.**

<img width="600" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/7a513c30-60f6-492d-ac5f-123a7dc7f023"/>

**접속한 페이지에서 채널 관리 봇을 입장시킬 채널을 선택합니다.**

<img width="400" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/1dd41009-42c9-4712-b2c2-c25833ed2561"/>

## 프로젝트 설정

**프로젝트를 클론합니다.**

```bash
git clone https://github.com/discord/discord-example-app.git](https://github.com/woowacourse-bot/discord-bot.git

cd discord-bot
```

**패키지를 설치합니다.**

```bash
npm install
```

## 환경변수 적용

**디스코드의 사용자 설정에서 개발자 모드를 작동시킵니다.**

<img width="600" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/1c1d0bf6-e40f-4da9-a167-c3423228f9ef"/>

**적용시킬 서버의 서버 ID를 복사한 후 환경변수의 `SERVER_ID`에 적용시킵니다.**

<img width="227" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/804f357d-f9ad-49a2-87a3-24581869fd45"/>

**디스코드 봇 페이지의 OAuth2의 General에서 클라이언트 ID를 복사한 후 환경변수의 `CLIENT_ID`에 적용시킵니다.**

<img width="400" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/8d1afce5-45fe-4d18-ae04-1a20c6c07e08"/>

**디스코드 봇 페이지의 Bot에서 Reset token을 눌러 토큰을 생성 후 환경변수의 `DISCORD_TOKEN`에 적용시킵니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/02ec46a4-465e-47c1-85b6-5e6667ad5ef4"/>

## 디스코드 봇 실행

**프로젝트를 실행합니다.**

```bash
npm start
```

**정상 실행시 접속 커맨드가 콘솔에 나타납니다.**

```bash
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
Logged in as 채널 관리 봇#0022!
```

## 채널 관리

**디스코드 봇이 작동 중인 상태에서는 스스로 만들기 채널에 대한 삭제 및 수정 권한은 어드민과 채널 생성자에게만 권한이 부여됩니다.**

`ex) 본인 생성 채널`

<img width="300" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/df9b19bc-eef3-4a8a-ba50-a8e234c38ad5"/>

`ex) 타인 생성 채널`

<img width="300" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/a8489cc4-f8a7-428d-99e9-f3a9ec42da87"/>

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
