import { prisma } from '../prisma.js';

async function logChat(message) {
    return await prisma.chat.create({
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
}

export { logChat };
