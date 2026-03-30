import { ai, openai } from '../index.js';

async function parseIntent(userMessage) {
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

    ## CONTEXT & LANGUAGE
    - Input Language: Indonesian (Slang, Casual, Mixed).
    - Context: Telegram Chat.

    ## OUTPUT FORMAT
    Return ONLY a valid JSON object. Do not include explanations.
    {
      'intent': 'CREATE' | 'READ' | 'UPDATE',
      'confidence_score': number (0.0 - 1.0),
      'original_query': 'string'
    }
  `;

  // const aiResponse = await ai.models.generateContent({ 
  //   model: 'gemini-3.1-flash-lite-preview',
  //   contents: userMessage,
  //   config: {
  //     responseMimeType: 'application/json',
  //     systemInstruction: systemPrompt,
  //   }
  // });

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-nano',
    input: userMessage,
    reasoning: {
      effort: 'minimal',
    },
    instructions: systemPrompt,
  })
  console.log(aiResponse);
  
  return JSON.parse(aiResponse.output_text);
}

export { parseIntent };