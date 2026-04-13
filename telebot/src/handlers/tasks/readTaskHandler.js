import logger from "../../logger/logger.js";
import { parseRead } from "../../ai/tasks/readTaskParser.js";
import { readTasks } from "../../services/taskService.js";
import { formatTaskCountReply, formatTaskListReply } from "../../utils/formatter.js";

export async function handleReadTask(ctx, message) {
  try {
    // AI parse to understand command and extract task ID or criteria
    const readInfo = await parseRead(message.messageText);
    logger.debug(`AI Extracted Read Info: ${JSON.stringify(readInfo)}`);

    // Service to read task(s) based on extracted info
    const result = await readTasks(message.userId, readInfo);

    let response;
    if (readInfo.queryType === 'count') {
      response = formatTaskCountReply(result.count, readInfo);
    } else {
      response = formatTaskListReply(result.tasks);
    }

    await ctx.reply(response, { parse_mode: 'HTML' });

  } catch (error) {
    logger.error(`Error in handleReadTask for user ${message.userId}:`, error);
    await ctx.reply("Waduh, ada kendala pas membaca taskmu.");
  }
}
