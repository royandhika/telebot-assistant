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

async function readTasks(userId, filters) {
  try {
    const now = new Date();
    const where = {
      userId: userId,
      // Default: exclude 'done' unless status is explicitly requested as 'done'
      status: filters.status ? filters.status : { not: 'done' },
      ...(filters.taskType && { taskType: filters.taskType }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.projectName && {
        projects: {
          name: filters.projectName
        }
      }),
      // Handle Date range
      ...( (filters.startDate || filters.endDate) ? {
        dueDate: {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        }
      } : {
        // Default: exclude expired tasks (dueDate < now)
        dueDate: {
          gte: now
        }
      }),
    };

    if (filters.queryType === 'count') {
      const count = await prisma.task.count({ where });
      return { count };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        projects: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    logger.info(`Read ${tasks.length} tasks for user ${userId} with filters: ${JSON.stringify(filters)}`);
    return { tasks };
  } catch (error) {
    logger.error(`Failed to read tasks for user ${userId}:`, error);
    throw error;
  }
}

export { createTask, readTasks };
