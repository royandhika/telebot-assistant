import { openai } from '../index.js';

/**
 * Parses the user's message to extract reminder details
 * @param {string} userMessage - The message from the user
 * @returns {Promise<Object>} The parsed reminder details
 */
export async function parseAddReminder(userMessage) {
	const today = new Date().toISOString();
	const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
	const systemPrompt = `
    ## ROLE
    You are a highly efficient Data Extraction Assistant. Your goal is to parse unstructured human natural language from Telegram messages into a structured JSON format specifically designed for a Prisma ORM insert payload.

    ## CONTEXT
    - Current UTC Time: ${dayName}, ${today}
    - Input Language: Indonesian (Mixed with Slang/Informal)
    - Database Requirement: The 'remindAt' field MUST be output in UTC (ISO 8601 format).
    - Timezone Logic: The user operates in WIB (UTC+7). You must calculate their intended local time, then subtract 7 hours to generate the precise UTC value.

    ## DATE & TIME LOGIC
    - "besok": Next calendar day.
    - "nanti malam": 19:00 WIB (12:00 UTC).
    - "besok pagi": 08:00 WIB (01:00 UTC) tomorrow.
    - "minggu depan": Exactly 7 days from today.
    - "jam X": Interpret logically (e.g., "jam 3 sore" = 15:00 WIB = 08:00 UTC).
    - "senin pagi": Next Monday at 08:00 WIB (01:00 UTC).
    - Default Time: If a date is mentioned but no specific time, default to 08:00 WIB (01:00 UTC) on that date.

    ## EXTRACTION RULES
    1. message: (String) Extract the core task and paraphrase it to be as clean and general as possible.
      - STRIP AWAY bot commands or conversational triggers (e.g., "/add", "bot tolong ingetin").
      - STRIP AWAY exact time references that are already mapped to 'remindAt' (e.g., "jam 5", "pukul 14.00"). It is acceptable to keep general contexts like "sore ini" if it sounds natural.
      - STRIP AWAY priority markers or excessive punctuation (e.g., "WAJIB!!", "PENTING", "URGENT") because they are handled by 'isPriority'.
      - Capitalize the first letter of the message.
    2. remindAt: (String | null) The calculated target date-time in ISO 8601 UTC. If no time/date context is found in the message, set to null.
    3. isPriority: (Boolean) Set to true ONLY if the user includes urgent keywords (e.g., "penting", "urgent", "asap", "cepetan", "prioritas") or uses strong emphasis (e.g., "!!!"). Otherwise, default to false.

    ## EXAMPLES
    Input: "Ke gereja sore ini jam 5. WAJIB!!"
    Output: { "message": "Ke gereja sore ini", "remindAt": "2024-05-20T10:00:00.000Z", "isPriority": true }

    Input: "bot tolong ingetin aku meeting bulanan besok jam 9 pagi PENTING BANGET"
    Output: { "message": "Meeting bulanan", "remindAt": "2024-05-21T02:00:00.000Z", "isPriority": true }

    Input: "beli galon air"
    Output: { "message": "Beli galon air", "remindAt": null, "isPriority": false }

    ## OUTPUT FORMAT
    Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json, and do not add any conversational text.
    {
      "message": string,
      "remindAt": string | null,
      "isPriority": boolean
    }
  `;

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-mini',
    input: userMessage,
    reasoning: { effort: 'minimal' },
    instructions: systemPrompt,
  })

  return JSON.parse(aiResponse.output_text);
}