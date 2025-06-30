import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!issues') {
    await handleIssuesCommand(message);
  }
});

async function handleIssuesCommand(message) {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/issues?state=open`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    const issues = response.data;

    if (issues.length === 0) {
      await message.channel.send('✅ No open issues!');
    } else {
      const issueList = issues
        .map((issue) => {
          const createdAt = new Date(issue.created_at).toISOString().split("T")[0];
          return `[#${issue.number}](${issue.html_url}) — ${issue.title}\nAuthor: ${issue.user.login} • Created: ${createdAt}\n`;
        })
        .join('\n');

      await message.channel.send({
        content: `📝 **Open Issues in ${repo}:**\n${issueList}`,
        allowedMentions: { parse: [] },
      });
    }
  } catch (err) {
    console.error(err);
    await message.channel.send('❌ Error fetching issues.');
  }
}

client.login(process.env.DISCORD_TOKEN);
