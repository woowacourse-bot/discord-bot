import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { EmbedBuilder } from '@discordjs/builders';
import { MESSAGE_PREFIX } from '../../constants/config.js';
import { NEWS_AMOUNT, NEWS_COMMAND, NEWS_THUMBNAIL, NEWS_URL } from '../../constants/news.js';

const createCommand = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  return args.shift().toLowerCase();
};

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randomSelect = (array, selectAmount) => {
  const arrayLength = array.length;
  const randomNumbers = new Set();

  while (randomNumbers.size < selectAmount) {
    randomNumbers.add(getRandom(0, arrayLength - 1));
  }

  return [...randomNumbers].map((number) => array[number]);
};

const news = (message) => {
  if (message.author.bot || !message.content.startsWith(MESSAGE_PREFIX)) return;

  const command = createCommand(message, MESSAGE_PREFIX);

  if (command === NEWS_COMMAND) {
    axios
      .get(NEWS_URL)
      .then((response) => {
        parseStringPromise(response.data)
          .then((result) => {
            const selectedRandomNews = randomSelect(result.rss.channel[0].item, NEWS_AMOUNT);
            const date = new Date(result.rss.channel[0].lastBuildDate);
            const options = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              timeZone: 'Asia/Seoul',
            };
            const koreanDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
            const embeds = new EmbedBuilder()
              .setURL(result.rss.channel[0].link[0])
              .setThumbnail(NEWS_THUMBNAIL)
              .setTitle('Google 뉴스 - 과학/기술');
            const newsList = [];

            selectedRandomNews.forEach((item) => {
              newsList.push({ name: item.title[0], value: `[링크](${item.link[0]})` });
            });
            embeds.addFields(...newsList);
            embeds.addFields({ name: '업데이트 시간', value: koreanDate });

            message.reply({ embeds: [embeds] });
          })
          .catch((error) => console.log(`Failed to parse xml: ${error}`));
      })
      .catch((error) => console.log(`Failed to load rss feed: ${error}`));
  }
};

export default news;
