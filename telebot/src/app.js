import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
import { setupHandlers } from './handlers/index.js';
import { setupReminderJob } from './jobs/reminder.js';

dotenv.config()

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Setup Cron Jobs
setupReminderJob(bot);

const publicUrl = process.env.PUBLIC_URL; 
const webhookPath = '/telegraf-webhook';

// Set webhook link
bot.telegram.setWebhook(`${publicUrl}${webhookPath}`);

// Use telegraf as a middleware
app.use(bot.webhookCallback(webhookPath));

// Setup Bot Handlers
setupHandlers(bot);

// General health check route
app.get('/', (req, res) => {
  res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});