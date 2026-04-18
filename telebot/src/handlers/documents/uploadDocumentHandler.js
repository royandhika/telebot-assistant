import logger from '../../logger/logger.js';
import axios from 'axios';
import FormData from 'form-data';
import { createDocumentLog } from '../../services/documentService.js';
import { formatUploadDocument } from '../../utils/formatter.js';

/**
 * Handles the addition of a new reminder
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @param {Object} message - The message object containing user input
 */
export async function handleUploadDocument(ctx, message) {
  try {
    ctx.sendChatAction('typing');
    // Extract document information from the context
    const document = ctx.message.document;
    const fileId = document.file_id;
    const fileName = document.file_name;
    const tableName = ctx.message.caption;
    logger.info(`Received document ${fileName} (id: ${fileId}) from user ${message.userId}` );
    
    // Get file link from Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    // Download the file from Telegram
    const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    logger.info(`Downloaded document ${fileName} from user ${message.userId}` );
    
    // Prepare form data for FastAPI
    const form = new FormData();
    form.append('table_name', tableName);
    form.append('file', buffer, {
      filename: fileName,
      contentType: document.mime_type,
    });

    // Send to FastAPI
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const uploadResponse = await axios.post(`${fastApiUrl}/upload`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    logger.info(`Document processed by FastAPI: ${JSON.stringify(uploadResponse.data)}`);

    // Service to log document details
    const newDocument = {
      userId: message.userId,
      fileName: fileName,
      fileId: fileId,
      mimeType: document.mime_type,
      s3Path: uploadResponse.data.s3_path,
      tableName: tableName,
      fastApiRes: uploadResponse.data,
    }
    const newLogDocument = await createDocumentLog(newDocument);

    // Build reply message
    const replyMessage = formatUploadDocument(newLogDocument);
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleUploadDocument for user ${message.userId}`);
    const errorMessage = error.response?.data?.detail || error.message;
    await ctx.reply(`Maaf, gagal mengolah dokumen: ${errorMessage}`);
  }
}