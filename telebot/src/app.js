import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { prisma } from './prisma.js';
dotenv.config()

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const publicUrl = process.env.PUBLIC_URL; 
const webhookPath = '/telegraf-webhook';
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

// Set webhook link
bot.telegram.setWebhook(`${publicUrl}${webhookPath}`);

// Use telegraf as a middleware
app.use(bot.webhookCallback(webhookPath));

// Bot command handler
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  const today = new Date().toISOString().split('T')[0];

  await prisma.user.create({
    data: {
      id: ctx.chat.id,
      username: ctx.chat.username,
    }
  })

//   try {
//     const aiResponse = await ai.models.generateContent({
//       model: "gemini-2.5-flash-lite",
//       contents: userMessage,
//       config: {
//         systemInstruction: "You are a helpful assistant that explains complex topics in simple terms, nothing more than 5 words.",
//         // thinkingConfig: {
//         //     thinkingLevel: "LOW",
//         // }
//       }
//     });
//     ctx.reply(`AI says: ${aiResponse.text}`);
//   } catch (error) {    
//     console.error(error);
//     ctx.reply("Waduh, ada kendala pas memproses perintahmu.");
//   }
//   ctx.reply(today);
//   try {
//     // 1. Kirim pesan ke GPT untuk di-parse jadi JSON
//     const gptResponse = await callGPT5Mini({
//       system: `Extract task info to JSON. Today is ${today}.`,
//       user: userMessage
//     });

//     const taskData = JSON.parse(gptResponse);

//     // 2. Logika berdasarkan action hasil parse GPT
//     if (taskData.action === 'CREATE') {
//       // Simpan ke MySQL: INSERT INTO tasks (title, deadline, user_id) ...
//       await db.query('INSERT INTO tasks SET ?', {
//         title: taskData.task_title,
//         deadline: taskData.deadline,
//         user_id: ctx.chat.id
//       });
//       ctx.reply(`✅ Sip! Task "${taskData.task_title}" sudah dicatat untuk deadline ${taskData.deadline}.`);
//     } 
    
//     else if (taskData.action === 'READ') {
//       // Query ke MySQL berdasarkan filter (Today/Week)
//       // Misalnya: SELECT * FROM tasks WHERE user_id = ... AND deadline = ...
//       const results = await getTasksFromDB(ctx.chat.id, taskData.filter_range);
      
//       if (results.length === 0) {
//         ctx.reply("Belum ada task yang terjadwal nih.");
//       } else {
//         const list = results.map(t => `- ${t.title} (${t.deadline})`).join('\n');
//         ctx.reply(`📋 Daftar task kamu:\n${list}`);
//       }
//     }

//   } catch (error) {
//     console.error(error);
//     ctx.reply("Waduh, ada kendala pas memproses perintahmu.");
//   }
});

// General health check route
app.get('/', (req, res) => {
  res.send('Bot is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
