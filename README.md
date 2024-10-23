<p align="middle">
  <img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/8c690010-c76b-4953-bd05-28cf3959aab9">
</p>

<p align="middle">우아한테크코스 프리코스 디스코드 채널 관리용 디스코드 봇 어플리케이션입니다.</p>

# 🛠️ Features

### 📌 채널 관리 권한 제한
  - 유저가 특정 카테고리 안에서 채널 생성시 채널에 대한 수정 및 삭제 권한을 해당 채널 생성 유저에게만 부여합니다.
  - 봇을 실행시 특정 카테고리 안에있는 기존 채널에 대한 수정 및 삭제 권한을 해당 채널 생성 유저에게만 부여합니다.

### 📌 특정 미션 레포 링크 생성
  - 명령어 : `!<미션 이름>:<지원 분야>`
  - 예시 : `!로또:be` , `!레이싱:aos`, `!야구:fe`, `!크리스마스:be`

### 📌 특정 미션에서 특정 지원자의 이름으로  검색된  pr 목록 링크 생성
  - 명령어: `!<미션 이름>:<지원 분야>:<지원자 이름>`
  - 예시 : `!로또:be:홍길동`, `!레이싱:fe:홍길동`, `!야구:aos:홍길동`
  - 인식하는 명령어
    - 미션 이름 : `로또`,  `레이싱`,  `야구`,  `크리스마스`
    - 지원 분야 : `be`, `fe`, `aos`

### 📌 Google 뉴스(과학/기술)링크 생성
  - 명령어 : `!뉴스`
  - 5개의 최신 과학/기술 뉴스링크가 생성됩니다.
  - 특정 시간마다 뉴스가 업데이트됩니다. 
  - 추후 `한국 경제` IT 뉴스로 변경될 수 있습니다.
<img width="250" alt="image" src="https://github.com/user-attachments/assets/7e4cb564-5fd3-40ec-aa52-3451e1effb8b">



### 📌 [Geek 뉴스](https://news.hada.io/) 링크 생성
  - 명령어: `!긱뉴스`
  - 7개의 최신 IT 뉴스가 생성됩니다. 
  - 특정 시간마다 뉴스가 업데이트됩니다.
  - GeekNews ?
    - GeekNews(긱뉴스) 는 이름과 같이 Geek들을 위한 뉴스 서비스 입니다.
    - Geek은 '전자 공학이나 지성(intellectuality) 등의 한 분야 혹은 여러 분야를 탁월하게 이해하고 있는 특이한 사람'을 지칭하는 단어라고 합니다만, 여기서는 `Geek = IT를 기반으로 하는 다양한 것들에 지적인 호기심을 가지고 있는 사람`을 의미합니다.
<img width="250" alt="image" src="https://github.com/user-attachments/assets/67bb25fe-b870-4190-bb85-3069847e9307">


### 📌 랜덤 주사위
  - 명령어: `!주사위`
  - 1~100사이의 랜덤한 숫자가 출력됩니다.
<img width="250" alt="image" src="https://github.com/user-attachments/assets/84dff5c9-0827-4f7c-9167-0a4a7d69f673">


# 🚀 Getting Started

## 디스코드 봇 생성

**[Discord Developer Portal](https://discord.com/developers/applications)에 접속하여 디스코드 봇을 생성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/cebba5ec-d188-4dd6-a7b8-fd86562b607d">

**생성할 봇의 이름을 작성합니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/9e8ee0c0-8a65-43e9-b4cd-94f11f26b87f">

## 디스코드 봇 퍼미션 설정

**`OAuth2` 항목에 `URL Generator`에서 `Scopes`의 `Bot`을 체크한 후 `Bot Permissions`에서 `Administrator`를 체크 한 후 생성된 url에 접속합니다.**

<img width="600" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/7a513c30-60f6-492d-ac5f-123a7dc7f023">

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

## 환경변수 적용

**디스코드의 사용자 설정에서 개발자 모드를 작동시킵니다.**

<img width="600" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/1c1d0bf6-e40f-4da9-a167-c3423228f9ef">

**적용시킬 서버의 서버 ID를 복사한 후 환경변수의 `SERVER_ID`에 적용시킵니다.**

<img width="227" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/804f357d-f9ad-49a2-87a3-24581869fd45">

**디스코드 봇 페이지의 OAuth2의 General에서 클라이언트 ID를 복사한 후 환경변수의 `CLIENT_ID`에 적용시킵니다.**

<img width="400" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/8d1afce5-45fe-4d18-ae04-1a20c6c07e08">

**디스코드 봇 페이지의 Bot에서 Reset token을 눌러 토큰을 생성 후 환경변수의 `DISCORD_TOKEN`에 적용시킵니다.**

<img width="600" alt="image" src="https://github.com/woowacourse-bot/discord-bot/assets/99083803/02ec46a4-465e-47c1-85b6-5e6667ad5ef4">

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

<img width="300" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/df9b19bc-eef3-4a8a-ba50-a8e234c38ad5">

`ex) 타인 생성 채널`

<img width="300" alt="image" src="https://github.com/cobocho/discord-bot/assets/99083803/a8489cc4-f8a7-428d-99e9-f3a9ec42da87">

### 📚 Reference

#### 채널 생성 감지

- [[Discord.js] Event.ChannelCreate](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Events)

#### 채널 정보 가져오기

- [[Discord.js] Fetch AuditLogs](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild?scrollTo=fetchAuditLogs)

#### 권한 부여

- [[Discord.js] Role Manager](https://old.discordjs.dev/#/docs/discord.js/main/class/RoleManager)
- [[Discord.js] Permissions](https://discordjs.guide/popular-topics/permissions.html#adding-overwrites)
