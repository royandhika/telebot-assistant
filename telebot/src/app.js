import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv, { parse } from 'dotenv';
import { prisma } from './prisma.js';
import { parseTask } from './ai.js';
dotenv.config()

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const publicUrl = process.env.PUBLIC_URL; 
const webhookPath = '/telegraf-webhook';

// Set webhook link
bot.telegram.setWebhook(`${publicUrl}${webhookPath}`);

// Use telegraf as a middleware
app.use(bot.webhookCallback(webhookPath));

// Bot command handler
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('text', async (ctx) => {
	const message = {
		userId: BigInt(ctx.message.from.id),
		username: ctx.message.from.username,
		messageId: ctx.message.message_id,
		messageText: ctx.message.text,
		langCode: ctx.message.from.language_code,
		createdAt: new Date(ctx.message.date * 1000),
	}

	try {
		// Log chat message
		await prisma.chat.create({
			data: {
				id: message.messageId,
				users: {
					connectOrCreate: {
						where: { id: message.userId },
						create: { id: message.userId }
					}
				},
				body: message.messageText,
				lang: message.langCode,
				createdAt: message.createdAt,
			}
		});

		const response = await parseTask(message.messageText)

		// Create new task 
		await prisma.task.create({
			data: {
				title: response.title,
				taskType: response.taskType,
				notes: response.notes,
				priority: response.priority,
				dueDate: response.dueDate,
				users: {
					connect: { id: message.userId }
				},
				projects: {
					connectOrCreate: {
						where: { name: response.projectName },
						create: { name: response.projectName }
					},
				},
			}
		});

		// Build reply message
		const replyParam = {
			projectName: response.projectName,
			title: response.title,
			dueDate: new Intl.DateTimeFormat('id-ID', {
				weekday: 'long',
				day: '2-digit',
				month: 'long',
				year: 'numeric',
				timeZone: 'Asia/Jakarta',
			}).format(new Date(response.dueDate)),
		}

		const replyMessage = `
			<b>🛠️ PROJECT:</b> ${replyParam.projectName}
			<b>📝 TASK:</b> ${replyParam.title}
			<b>📆 DEADLINE:</b> ${replyParam.dueDate}
		`.replace(/^\s+/gm, '');
		
		ctx.reply(replyMessage, { parse_mode: 'HTML' });

	} catch (error) {
		console.error('Database error:', error);
		ctx.reply("Waduh, ada kendala pas menyimpan pesanmu.");
	}

});

// General health check route
app.get('/', (req, res) => {
  res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
