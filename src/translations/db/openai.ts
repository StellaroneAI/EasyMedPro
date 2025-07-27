// OpenAI API integration for EasyMedPro
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getHealthAdvice(prompt: string) {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });
  return response.data.choices[0].message?.content;
}

// Example usage:
// getHealthAdvice('What should I do for high blood pressure?').then(console.log);
