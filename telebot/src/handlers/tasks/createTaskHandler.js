import { createTask } from '../../services/taskService.js';
import { parseTask } from '../../ai/tasks/createTaskParser.js';
import { formatTaskDueDate, buildTaskReplyMessage } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

export async function handleCreateTask(ctx, message) {
  try {
    // AI parse to extract task details
    const taskInfo = await parseTask(message.messageText);
    logger.debug(`AI Extracted Task Info: ${JSON.stringify(taskInfo)}`);
    
    // Service to create task
    const newTask = await createTask(message.userId, taskInfo);
    
    // Build reply message
    newTask.projectName = taskInfo.projectName;
    newTask.dueDate = formatTaskDueDate(newTask.dueDate);
    const replyMessage = buildTaskReplyMessage(newTask);
    
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleCreateTask for user ${message.userId}:`, error);
    await ctx.reply("Maaf, gagal membuat task. Coba ulangi detail tugasnya dengan jelas.");
  }
}
