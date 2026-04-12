import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

/**
 * Creates a new reminder for a specific user
 * @param {number} userId - The ID of the user
 * @param {Object} reminderDetail - The details of the reminder to create
 * @returns {Promise<Object>} The created reminder object
 */
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

/**
 * Fetches reminders for a specific user based on a filter
 * @param {number} userId - The ID of the user
 * @param {Object} filter - The filter criteria for fetching reminders
 * @returns {Promise<Array>} The list of reminders matching the criteria
 */
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

/**
 * Updates the status of a reminder based on the action taken
 * @param {number} reminderId - The ID of the reminder to update
 * @param {string} action - The action to perform (e.g., 'complete', 'snooze_30m', 'snooze_1d')
 * @returns {Promise<Object>} The updated reminder object
 */
async function updateReminderStatus(reminderId, action) {
  try {
    let dataToUpdate = {
      modifiedAt: new Date()
    };
    
    if (action === 'complete') {
      dataToUpdate.status = 'completed';
    } else if (action === 'snooze_30m') {
      dataToUpdate.status = 'pending';
      dataToUpdate.remindAt = new Date(Date.now() + 30 * 60000);
    } else if (action === 'snooze_1d') {
      dataToUpdate.status = 'pending';
      dataToUpdate.remindAt = new Date(Date.now() + 24 * 60 * 60000);
    } else {
      logger.warn(`Unknown action ${action} for reminder ID ${reminderId}`);
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: dataToUpdate
    });

    logger.info(`Reminder ID ${reminderId} status updated to ${dataToUpdate.status}`);
    return updatedReminder;
  } catch (error) {
    logger.error(`Failed to update status for reminder ID ${reminderId}:`, error);
    throw error;
  }
}

export { 
  createReminder, 
  getReminder,
  updateReminderStatus
};