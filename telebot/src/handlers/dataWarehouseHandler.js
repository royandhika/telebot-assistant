import logger from '../logger/logger.js';
import axios from 'axios';
import FormData from 'form-data';
import { createDocumentLog } from '../services/documentService.js';
import { formatUploadDocument } from '../utils/formatter.js';

/**
 * Handles the upload of a document to ClickHouse via FastAPI
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleUploadDocument(ctx) {
  const message = ctx.state.parsedMessage;
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
      tableName: uploadResponse.data.table_name,
      fastApiRes: uploadResponse.data,
    }
    const newLogDocument = await createDocumentLog(newDocument);

    // Build reply message
    const replyMessage = formatUploadDocument(newLogDocument);
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleUploadDocument for user ${message?.userId}`);
    const errorMessage = error.response?.data?.detail || error.message;
    await ctx.reply(`Maaf, gagal mengolah dokumen: ${errorMessage}`);
  }
}

/**
 * Handles reading data from ClickHouse table
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleReadTable(ctx) {
  const userId = ctx.from.id;
  try {
    ctx.sendChatAction('typing');

    // Extract table name from command /read <table_name>
    const messageText = ctx.message.text;
    const parts = messageText.split(' ');

    if (parts.length < 2) {
      return ctx.reply('Format salah. Gunakan: /read <nama_table>');
    }

    const tableName = parts[1];
    logger.info(`User ${userId} requested to read table: ${tableName}`);

    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const response = await axios.get(`${fastApiUrl}/read/${tableName}`, {
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'];

    if (contentType === 'image/png') {
      await ctx.replyWithPhoto(
        { source: Buffer.from(response.data) }, 
        { caption: `Berikut adalah data dari table: <code>${tableName}</code>`, parse_mode: 'HTML' }
      );
    } else {
      // If not an image, it might be JSON (error message)
      const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
      await ctx.reply(`Gagal membaca data: ${jsonResponse.detail || 'Terjadi kesalahan'}`);
    }
  } catch (error) {
    logger.error(`Error in handleReadTable for user ${userId}: ${error.message}`);
    
    let errorMessage = error.message;
    if (error.response && error.response.data) {
      try {
        const errorData = JSON.parse(Buffer.from(error.response.data).toString());
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    
    await ctx.reply(`Maaf, gagal mengambil data dari table: ${errorMessage}`);
  }
}
