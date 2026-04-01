import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

async function createTask(userId, taskDetail) {
  try {
    const newTask = await prisma.task.create({
      data: {
        title: taskDetail.title,
        taskType: taskDetail.taskType,
        notes: taskDetail.notes,
        priority: taskDetail.priority,
        dueDate: taskDetail.dueDate,
        users: {
          connect: { id: userId }
        },
        projects: {
          connectOrCreate: {
            where: { name: taskDetail.projectName },
            create: { name: taskDetail.projectName }
          },
        },
      }
    });

    logger.info(`Task created: "${newTask.title}" for user ${userId}`);
    return newTask;
  } catch (error) {
    logger.error(`Failed to create task for user ${userId}:`, error);
    throw error;
  }
}

export { createTask };
