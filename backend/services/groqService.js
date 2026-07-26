const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateImagePrompt(productName, description) {
  const systemInstruction = `You are an expert prompt engineer for AI image generation.
Given a product name and description, write ONE concise, vivid image-generation prompt
that would produce a beautiful, professional lifestyle/product photo of it.
Focus on lighting, setting, composition, and mood. Return ONLY the prompt text, nothing else.`;

  const userPrompt = `Product Name: ${productName}\nDescription: ${description}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt }
    ],
    model: 'llama-3.3-70b-versatile',
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { generateImagePrompt };