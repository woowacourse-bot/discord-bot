<p align="middle">
  <img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/8c690010-c76b-4953-bd05-28cf3959aab9">
</p>

<p align="middle">우아한테크코스 프리코스 디스코드 스스로 만들기 채널 관리용 디스코드 봇 어플리케이션입니다.</p>

# 🛠️ 구현 기능

- 채널 관리 권한 제한
  - 채널에 대한 수정 및 삭제 권한을 **어드민과 해당 채널 생성 유저**에게만 부여합니다.

# 🚀 Get to start

## 디스코드 봇 생성

**[Discord Developer Portal](https://discord.com/developers/applications)에 접속하여 디스코드 봇을 생성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/cebba5ec-d188-4dd6-a7b8-fd86562b607d">

**생성할 봇의 이름을 작성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/9e8ee0c0-8a65-43e9-b4cd-94f11f26b87f">

**`Settings` 항목에 `Bot`에서 `Reset token`을 눌러 토큰을 생성 후 복사합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/02ec46a4-465e-47c1-85b6-5e6667ad5ef4">

## 디스코드 봇 퍼미션 설정

**`OAuth2` 항목에 `URL Genarator`에서 `Scopes`의 `Bot`을 체크한 후 `Bot Permissions`에서 `Manage Channels`를 체크 한 후 생성된 url에 접속합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/c0ba0f13-ca96-40e2-83bc-a3d662502548">

**접속한 페이지에서 채널 관리 봇을 입장시킬 채널을 선택합니다.**

<img width="400" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/1dd41009-42c9-4712-b2c2-c25833ed2561">

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

## 토큰 및 APP_ID 적용

`index.js`에 `TOKEN`과 `APP_ID`를 채널 관리 봇의 토큰과 APP_ID로 수정합니다.

```js
//...

// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
const rest = new REST({ version: '10' }).setToken('실제 토큰');

//...

// SETTINGS - General Information - APPLICATION ID를 applicationCommands의 인수로 넣어주세요.
await rest.put(Routes.applicationCommands('실제 APP_ID'), { body: commands });

//...

// DISCORD 내 BOT TOKEN을 setToken의 인수로 넣어주세요.
client.login('실제 토큰');
```

## 디스코드 봇 실행

**프로젝트를 실행합니다.**

```bash
npm run start
```

**정상 실행시 접속 커맨드가 콘솔에 나타납니다.**

```bash
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
Logged in as 채널 관리 봇#0022!
```

## 채널 관리

**디스코드 봇이 작동 중인 상태에서는 채널에 대한 삭제 및 수정 권한은 어드민과 채널 생성자에게만 권한이 부여됩니다.**

<img width="300" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/1d85c623-dc6d-4176-82c2-a626c02a88a2">

# 📚 Reference

### 채널 생성 감지

- [[Discord.js] Event.ChannelCreate](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Events)

### 채널 정보 가져오기

- [[Discord.js] Fetch AuditLogs](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild?scrollTo=fetchAuditLogs)

### 권한 부여

- [[Discord.js] Role Manager](https://old.discordjs.dev/#/docs/discord.js/main/class/RoleManager)
- [[Discord.js] Permissions](https://discordjs.guide/popular-topics/permissions.html#adding-overwrites)
