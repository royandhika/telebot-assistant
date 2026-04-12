import { openai } from '../index.js';

export async function parseGetReminder(userMessage) {
	const today = new Date().toISOString();
	const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
	const systemPrompt = `
    ## ROLE
    You are a specialized Data Query Assistant. Your objective is to translate natural language requests from Telegram users into a strict JSON object that will be used directly as a Prisma ORM 'where' filter to fetch Reminder records.

    ## CONTEXT & SCHEMA
    - Current UTC Time: ${dayName}, ${today}
    - Timezone Logic: The user operates in WIB (UTC+7). You MUST adjust dates to UTC.
      For example, "Today in WIB" (00:00:00 to 23:59:59 WIB) converts to UTC as:
      - gte (Start): Yesterday 17:00:00.000Z
      - lte (End): Today 16:59:59.999Z

    ## PRISMA CONTEXT
    - Current prisma db is MySQL. Use appropriate date formats and operators.
    - 'message' (String): The task description.
    - 'status' (String): 'pending', 'sent', 'completed', 'cancelled'.
    - 'remindAt' (DateTime): Target reminder time in UTC.
    - 'isPriority' (Boolean): true or false.

    ## EXTRACTION & FILTERING RULES
    1. No 'userId': Do NOT include 'userId' in your output. The system will inject it automatically.
    2. Status Filtering: 
      - If the user asks for completed or cancelled tasks, set 'status' to "completed" or "cancelled".
      - If the user just asks for "my reminders", "what to do", or "hari ini", set 'status' to "pending" by default.
    3. Date Range (remindAt):
      - If the user specifies a timeframe ("hari ini", "besok", "minggu ini"), you MUST provide a date range using "gte" and "lte" in ISO 8601 UTC format.
    4. Priority Filtering (isPriority):
      - If the user asks for "penting", "urgent", or "wajib", set "isPriority": true.
    5. Keyword Search (message):
      - If the user searches for a specific topic (e.g., "soal meeting", "tentang gereja"), use Prisma's string filter: { "contains": "keyword" }. Do NOT use "mode: insensitive".

    ## EXAMPLES

    Input: "tampilin reminder besok"
    Output: {
      "status": "pending",
      "remindAt": {
        "gte": "2024-05-20T17:00:00.000Z",
        "lte": "2024-05-21T16:59:59.999Z"
      }
    }

    Input: "apa aja reminder penting hari ini?"
    Output: {
      "status": "pending",
      "isPriority": true,
      "remindAt": {
        "gte": "2024-05-19T17:00:00.000Z",
        "lte": "2024-05-20T16:59:59.999Z"
      }
    }

    Input: "cari reminder soal gereja yang udah selesai"
    Output: {
      "status": "completed",
      "message": { "contains": "gereja", "mode": "insensitive" }
    }

    Input: "tampilin semua reminder"
    Output: {
      "status": "pending"
    }

    Input: "cari reminder soal gereja yang udah selesai"
    Output: {
      "status": "completed",
      "message": { "contains": "gereja" }
    }

    ## OUTPUT FORMAT
    Return ONLY a valid JSON object representing the Prisma 'where' clause. No markdown blocks, no text.
  `;

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-mini',
    input: userMessage,
    reasoning: { effort: 'minimal' },
    instructions: systemPrompt,
  })

  return JSON.parse(aiResponse.output_text);
}