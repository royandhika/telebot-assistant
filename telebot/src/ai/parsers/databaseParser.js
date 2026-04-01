import { openai } from '../index.js';

export async function parseDatabaseInfo(userMessage) {
  const systemPrompt = `
    ## ROLE
    You are a Technical Data Extractor. Your job is to extract database connection details from a user's message.

    ## EXTRACTION RULES
    1. name: Name of the database/schema.
    2. host: IP address or domain name.
    3. port: Connection port (default to 3306 for MySQL/MariaDB, 5432 for Postgres if not specified).
    4. username: Database user.
    5. password: Connection password.
    6. dialect: Identify if it's 'mysql', 'postgres', 'mongodb', 'clickhouse', or 'unknown'.

    ## OUTPUT FORMAT
    Return ONLY a valid JSON object.
    {
      "name": "string",
      "host": "string",
      "port": number,
      "username": "string",
      "password": "string",
      "dialect": "string"
    }
  `;

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-nano',
    input: userMessage,
    reasoning: { effort: 'minimal' },
    instructions: systemPrompt,
  });

  return JSON.parse(aiResponse.output_text);
}