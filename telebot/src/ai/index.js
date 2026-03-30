import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});
const openai = new OpenAI({
    apiKey: process.env.GPT_KEY
})

export { ai, openai };