import { prisma } from '../prisma.js';

async function createTask(userId, response) {
    return await prisma.task.create({
        data: {
            title: response.title,
            taskType: response.taskType,
            notes: response.notes,
            priority: response.priority,
            dueDate: response.dueDate,
            users: {
                connect: { id: userId }
            },
            projects: {
                connectOrCreate: {
                    where: { name: response.projectName },
                    create: { name: response.projectName }
                },
            },
        }
    });
}

export { createTask };
