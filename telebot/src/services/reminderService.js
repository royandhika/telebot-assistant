import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

async function createReminder(userId, reminderDetail) {
  try {
    const newReminder = await prisma.reminder.create({
      data: {
        message: reminderDetail.message,
        remindAt: reminderDetail.remindAt,
        isPriority: reminderDetail.isPriority,
        users: {
          connect: { id: userId }
        },
      }
    });

    logger.info(`Reminder created: ID ${newReminder.id} for user ${userId}`);
    return newReminder;
  } catch (error) {
    logger.error(`Failed to create reminder for user ${userId}:`, error);
    throw error;
  }
}

async function getReminder(userId, filter) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: userId,
        ...filter
      },
      orderBy: {
        remindAt: 'asc'
      }
    });

    logger.info(`Fetched ${reminders.length} reminders for user ${userId}`);
    return reminders;
  } catch (error) {
    logger.error(`Failed to fetch reminders for user ${userId}:`, error);
    throw error;
  }
}

export { createReminder, getReminder };