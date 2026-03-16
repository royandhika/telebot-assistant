import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const publicUrl = process.env.PUBLIC_URL; // e.g. 'https://your-app-name.fly.dev'
const webhookPath = '/telegraf-webhook'; // Secret path

// Set webhook
bot.telegram.setWebhook(`${publicUrl}${webhookPath}`);

// Use Telegraf as a middleware for Express
app.use(bot.webhookCallback(webhookPath));

// Bot command handler
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('text', (ctx) => ctx.reply('Hello from Express webhook!'));

// General health check route
app.get('/', (req, res) => {
  res.send('Bot is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
