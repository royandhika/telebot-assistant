import { ai, openai } from '../index.js';

export async function parseIntent(userMessage) {
  const systemPrompt = `
    ## ROLE
    You are a highly accurate Intent Classifier for a Task Management Bot. Your sole purpose is to categorize user messages into one of three specific actions.

    ## INTENT DEFINITIONS
    1. **CREATE**: User wants to add, save, or record a new task/project.
    - Keywords sample: "tambah", "input", "ada task", "tolong catat", "bikin", "deadline".
    2. **READ**: User wants to see, check, list, or find existing tasks.
    - Keywords sample: "lihat", "tampilkan", "apa saja", "list", "cek", "ada apa aja hari ini".
    3. **UPDATE**: User wants to change, edit, complete, or delete an existing task.
    - Keywords sample: "ubah", "edit", "ganti", "selesai", "hapus", "cancel", "tunda".
    4. **ADD_DATABASE**: User wants to register, add, or connect a new database/DWH.
    - Keywords sample: "daftarkan db", "koneksi database", "tambah dwh", "ip port user pass".
    5. **EDIT_DATABASE**: User wants to update, change credentials, or modify existing database connection.
    - Keywords sample: "update password db", "ganti ip database", "ubah koneksi dwh".

    ## CONTEXT & LANGUAGE
    - Input Language: Indonesian (Slang, Casual, Mixed).
    - Context: Telegram Chat.

    ## OUTPUT FORMAT
    Return ONLY a valid JSON object. Do not include explanations.
    {
      "intent": "CREATE" | "READ" | "UPDATE" | "ADD_DATABASE" | "EDIT_DATABASE",
      "confidence_score": number (0.0 - 1.0),
      "original_query": "string"
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