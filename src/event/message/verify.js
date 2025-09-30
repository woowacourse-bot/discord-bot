import { EmbedBuilder } from 'discord.js';
import MemberDao from '../../database/MemberDao.js';

/**
 *
 * @param message
 */
export default async function verify(message) {
  if (!message.content.startsWith('!인증')) {
    return undefined;
  }
  // DM에서 명령 사용 시 안내 메시지 후 종료
  if (!message.guild) {
    try {
      const dmNotice = new EmbedBuilder()
        .setColor('#ffa726')
        .setTitle('인증 안내')
        .setDescription('이 명령어는 서버 인증 채널에서만 사용할 수 있습니다. 인증 채널에서 `!인증`을 입력해 주세요.')
        .setTimestamp();
      await message.reply({ embeds: [dmNotice] });
    } catch (e) {
      // ignore
    }
    return undefined;
  }

  try {
    // 이미 인증된 회원인지 확인 (DB 연결 즉시 해제)
    let existingMember;
    try {
      existingMember = await MemberDao.findByDiscordId(message.author.id);
    } catch (dbError) {
      console.error('DB 조회 오류:', dbError);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('데이터베이스 연결 오류')
        .setDescription('일시적인 오류입니다. 잠시 후 다시 시도해주세요.')
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
      return undefined;
    }
    
    if (existingMember) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('이미 인증된 회원입니다')
        .setDescription('이미 인증이 완료된 회원입니다.')
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      return undefined;
    }

    // 1단계: 이름 입력 요청 (20초 제한 고지)
    const nameEmbed = new EmbedBuilder()
      .setColor('#4ecdc4')
      .setTitle('1단계: 이름 입력')
      .setDescription('본명을 입력해주세요. (예: 홍길동)\n\n제한시간: 20초 내에 응답')
      .setTimestamp();
    
    await message.reply({ embeds: [nameEmbed] });
    
    // 이름 입력 대기
    const nameFilter = (response) => response.author.id === message.author.id;
    const nameCollector = message.channel.createMessageCollector({ 
      filter: nameFilter, 
      time: 20000, 
      max: 1 
    });
    
    nameCollector.on('collect', async (nameResponse) => {
      const realName = nameResponse.content.trim();
      
      // 이름 검증 (한글 2~4자)
      if (!/^[가-힣]{2,4}$/.test(realName)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('잘못된 이름 형식')
          .setDescription('한글 2~4자의 본명을 입력해주세요.')
          .setTimestamp();
        
        await nameResponse.reply({ embeds: [errorEmbed] });
        return;
      }

      // 2단계: 이메일 입력 요청 (20초 제한 고지)
      const emailEmbed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle('2단계: 이메일 입력')
        .setDescription(`안녕하세요 ${realName}님! 이제 이메일을 입력해주세요.\n(예: hongkildong@woowacourse.io)\n\n제한시간: 20초 내에 응답`)
        .setTimestamp();
      
      await nameResponse.reply({ embeds: [emailEmbed] });
      
      // 이메일 입력 대기 (20초)
      const emailFilter = (response) => response.author.id === message.author.id;
      const emailCollector = message.channel.createMessageCollector({ 
        filter: emailFilter, 
        time: 20000, 
        max: 1 
      });
      
      emailCollector.on('collect', async (emailResponse) => {
        const email = emailResponse.content.trim();

        // 이메일 형식 간단 검증
        if (!/.+@.+\..+/.test(email)) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('잘못된 이메일 형식')
            .setDescription('이메일 형식이 올바르지 않습니다. 예: hong@example.com')
            .setTimestamp();
          await emailResponse.reply({ embeds: [errorEmbed] });
          return;
        }

        // 3단계: 화이트리스트 확인 및 바인딩/역할 부여
        const processingEmbed = new EmbedBuilder()
          .setColor('#ffa726')
          .setTitle('3단계: 인증 처리중...')
          .setDescription('화이트리스트 확인 후 역할을 부여하고 있습니다.')
          .setTimestamp();
        
        const processingMessage = await emailResponse.reply({ embeds: [processingEmbed] });

        try {
          // 화이트리스트 조회 (name+email)
          const whitelist = await MemberDao.findByNameEmail(realName, email);
          if (!whitelist) {
            const notFound = new EmbedBuilder()
              .setColor('#ff6b6b')
              .setTitle('화이트리스트에 없음')
              .setDescription('입력한 이름/이메일을 찾을 수 없습니다. 운영진에게 문의하거나 정보를 확인한 후 다시 `!인증`을 시도해주세요.')
              .setTimestamp();
            await processingMessage.edit({ embeds: [notFound] });
            return;
          }

          // 이미 바인딩/인증된 경우 처리
          if (whitelist.discordId && whitelist.verified) {
            const already = new EmbedBuilder()
              .setColor('#4ecdc4')
              .setTitle('이미 인증된 정보')
              .setDescription('해당 정보는 이미 인증되었습니다.')
              .setTimestamp();
            await processingMessage.edit({ embeds: [already] });
            return;
          }

          // 바인딩 및 인증 완료 처리
          await MemberDao.verifyAndBindDiscordId(whitelist.id, message.author.id);

          // 역할 부여
          const { guild } = message;
          const member = guild.members.cache.get(message.author.id);
          const role = guild.roles.cache.get(process.env.ONBOARDING_ROLE_ID);
          
          if (role) {
            await member.roles.add(role);
          }

          const successEmbed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('🎉 인증 완료!')
            .setDescription(`**이름:** ${realName}\n**이메일:** ${email}\n\n화이트리스트와 일치하여 인증이 완료되었습니다!`)
            .setFooter({ text: '우아한테크코스 프리코스에 오신 것을 환영합니다!' })
            .setTimestamp();
          
          await processingMessage.edit({ embeds: [successEmbed] });

        } catch (dbError) {
          console.error('DB 저장 중 오류:', dbError);
          
          const dbErrorEmbed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('데이터베이스 오류')
            .setDescription('인증 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.')
            .setTimestamp();
          
          await processingMessage.edit({ embeds: [dbErrorEmbed] });
        }
      });

      emailCollector.on('end', (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#ffa726')
            .setTitle('이메일 입력 시간 초과')
            .setDescription('이메일 입력이 20초 내에 도착하지 않았습니다. 채널에서 다시 `!인증`을 입력해 재시도해주세요.')
            .setTimestamp();
          
          message.channel.send({ embeds: [timeoutEmbed] });
        }
      });
    });

    nameCollector.on('end', (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#ffa726')
          .setTitle('이름 입력 시간 초과')
          .setDescription('이름 입력이 20초 내에 도착하지 않았습니다. 채널에서 다시 `!인증`을 입력해 재시도해주세요.')
          .setTimestamp();
        
        message.channel.send({ embeds: [timeoutEmbed] });
      }
    });

  } catch (error) {
    console.error('인증 처리 중 오류:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle('인증 오류')
      .setDescription('인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      .setTimestamp();
    
    message.reply({ embeds: [errorEmbed] });
  }

  return undefined;
}
