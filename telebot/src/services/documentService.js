import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

/**
 * Log a new document upload to the database
 * @param {Object} data - Document log data
 * @param {number|BigInt} data.userId - Telegram user ID
 * @param {string} data.fileName - Original file name
 * @param {string} [data.fileId] - Telegram file ID
 * @param {string} [data.mimeType] - MIME type of the file
 * @param {string} [data.s3Path] - S3/MinIO path of the archived file
 * @param {string} [data.tableName] - Name of the table created
 * @param {Object} [data.fastApiRes] - Response from FastAPI
 * @returns {Promise<Object>} The created document log record
 */
export async function createDocumentLog({ userId, fileName, fileId, mimeType, s3Path, tableName, fastApiRes }) {
  try {
    const documentLog = await prisma.documentLog.create({
      data: {
        userId: BigInt(userId),
        fileName,
        fileId,
        mimeType,
        s3Path,
        tableName,
        fastApiRes: fastApiRes ? JSON.stringify(fastApiRes) : null,
      },
    });

    logger.info(`Document log created for user ${userId}: ${s3Path}`);
    return documentLog;
  } catch (error) {
    logger.error(`Failed to create document log for user ${userId}:`, error);
    // Dont throw error to avoid breaking the main upload process
    return null;
  }
}
