import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';
import { encrypt } from '../utils/crypto.js';

async function addDatabase(dbInfo) {
  try {
    // Two-way encryption
    const encryptedPassword = encrypt(dbInfo.password);

    const newDb = await prisma.database.create({
      data: {
        name: dbInfo.name,
        host: dbInfo.host,
        port: parseInt(dbInfo.port),
        username: dbInfo.username,
        password: encryptedPassword,
        dialect: dbInfo.dialect,
      }
    });

    logger.info(`Database successfully registered: ${newDb.name} (${newDb.host}:${newDb.port})`);
    return newDb;
  } catch (error) {
    logger.error(`Failed to register database "${dbInfo.name}" on host ${dbInfo.host}:`, error);
    throw error;
  }
}

export { addDatabase };