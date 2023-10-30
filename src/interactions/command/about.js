const about = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'developer') {
    await interaction.reply('https://github.com/woowacourse-bot/discord-bot');
  }
};

export default about;
