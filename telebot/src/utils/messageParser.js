/**
 * Standardizes the Telegram context message into a consistent object format.
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @returns {Object} Standardized message object
 */
export function createMessageObject(ctx) {
  return {
    userId: BigInt(ctx.message.from.id),
    username: ctx.message.from.username,
    messageId: ctx.message.message_id,
    messageText: ctx.message.text || ctx.message.caption,
    langCode: ctx.message.from.language_code,
    createdAt: new Date(ctx.message.date * 1000),
  };
}
