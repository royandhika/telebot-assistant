import { logChat } from '../services/chatService.js';
import { createTask } from '../services/taskService.js';
import { parseTask } from '../ai/parsers/taskParser.js';
import { parseIntent } from '../ai/parsers/intentParser.js';
import { formatTaskDueDate, buildTaskReplyMessage } from '../utils/formatter.js';

export async function handleTextMessage(ctx) {
  const message = {
    userId: BigInt(ctx.message.from.id),
    username: ctx.message.from.username,
    messageId: ctx.message.message_id,
    messageText: ctx.message.text,
    langCode: ctx.message.from.language_code,
    createdAt: new Date(ctx.message.date * 1000),
  }

  try {
    ctx.sendChatAction('typing');

    // Log chat message
    await logChat(message);

    // Intention parsing
    const intention = await parseIntent(message.messageText);
    console.log(intention);
    
    switch (intention.intent) {
      case 'CREATE':
        await handleCreate(ctx, message);
        break;
      case 'READ':
        await handleRead(ctx, message);
        break;
      case 'UPDATE':
        await handleUpdate(ctx, message);
        break;
      default:
        ctx.reply("Maaf, untuk saat ini saya hanya bisa membantu membuat task baru. Coba kirim pesan dengan format yang mengindikasikan penambahan task ya!");
    }

  } catch (error) {
    console.error('Text handler error:', error);
    ctx.reply("Waduh, ada kendala pas menyimpan pesanmu.");
  }
}

async function handleCreate(ctx, message) {
  // AI parse to extract task details
  const response = await parseTask(message.messageText);

  // Service to create task
  await createTask(message.userId, response);

  // Formatting
  const dueDateFormatted = formatTaskDueDate(response.dueDate);
  const replyMessage = buildTaskReplyMessage({
    projectName: response.projectName,
    title: response.title,
    dueDate: dueDateFormatted,
  });
  
  ctx.reply(replyMessage, { parse_mode: 'HTML' });
}

async function handleRead(ctx, message) {
  ctx.reply("🔨 Fitur baca task masih dalam pengembangan, ya! Sementara ini coba buat task baru dulu, yuk!");
}

async function handleUpdate(ctx, message) {
  ctx.reply("🔨 Fitur update task masih dalam pengembangan, ya! Sementara ini coba buat task baru dulu, yuk!");
}