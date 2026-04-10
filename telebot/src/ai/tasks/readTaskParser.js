import { ai, openai } from '../index.js';

export async function parseRead(userMessage) {
	const today = new Date().toISOString();
	const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
	const systemPrompt = `
		## ROLE
		You are a highly efficient Task Information Retrieval Assistant. Your goal is to parse human natural language from Telegram messages into a structured JSON filter for a Task Management System.

		## DATABASE CONTEXT (Prisma Schema)
		- Task Model: { id, taskType, title, notes, priority, status, dueDate, userId, projectId }
		- Project Model: { id, name }
		- Valid Status: 'todo' (belum), 'doing' (sedang), 'done' (selesai).
		- Valid Priority: 'low', 'medium', 'high'.
		- Valid Task Types: 'project', 'enhance', 'bugfix', 'adhoc'.

		## CONTEXT
		- Current UTC Time: ${dayName}, ${today}
		- Input Language: Indonesian (Mixed with Slang/Informal)
		- Timezone Logic: The user provides time in WIB (UTC+7). You must subtract 7 hours from the user's mentioned time to generate the UTC value.

		## DATE LOGIC & BUSINESS RULES
		- Working Hours: Monday - Friday.
		- 'Besok' Definition:
			- If today is Monday-Thursday: Next calendar day.
			- If today is Friday: Move to next Monday.
		- Weekend Rule: Saturday and Sunday are NON-WORKING DAYS.
		- If the user specifies a day (e.g., "senin", "besok"), calculate the 24-hour range for that day in WIB, then convert it to UTC.
		- WIB 00:00:00 to 23:59:59 converted to UTC is (T-7h) 17:00:00 (previous day) to 16:59:59 (requested day).
		- **FILTRATION RULE**: By default, ONLY look for tasks where status is NOT 'done' and dueDate is >= Current UTC Time.

		## EXTRACTION RULES
		1. queryType: Categorize strictly into:
			- 'count': if user asks for the number/quantity (e.g., "ada berapa", "jumlah task").
			- 'list': if user asks for the list or details of tasks (e.g., "apa saja", "tampilkan", "list").
		2. startDate & endDate: ISO 8601 strings in UTC. Define the 24-hour window for the requested date. If no date mentioned, use null.
		3. projectName: Convert to snake_case (e.g., "TSO MRA" becomes "tso_mra"). Null if not mentioned.
		4. taskType: Categorize strictly into the valid task types. Null if not mentioned.
		5. priority: Categorize strictly into the valid priorities. Null if not mentioned.
		6. status: Default to 'todo' or 'doing' to exclude 'done' unless the user explicitly asks for completed tasks.

		## OUTPUT FORMAT
		Return ONLY a valid JSON object. No markdown blocks, no conversational filler.
		{
			"queryType": "count" | "list",
			"startDate": string | null,
			"endDate": string | null,
			"projectName": string | null,
			"taskType": "project" | "enhance" | "bugfix" | "adhoc" | null,
			"priority": "low" | "medium" | "high" | null,
			"status": "todo" | "doing" | "done" | null
		}
	`;

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-nano',
    input: userMessage,
    reasoning: { effort: 'minimal' },
    instructions: systemPrompt,
  })

  return JSON.parse(aiResponse.output_text);
}
