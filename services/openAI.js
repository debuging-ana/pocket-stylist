/*import OpenAI from 'openai';
import Constants from "expo-constants";

const { openAiSecretKey } = Constants.expoConfig.extra;

//create an OpenAI object with the necessary credentials.
const openai = new OpenAI({
  apiKey: openAiSecretKey,
  dangerouslyAllowBrowser: true,
});

//all this prompt is to send the request to ChatGPT
export async function generateImageFromPrompt(prompt) {
  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });
    return `data:image/png;base64,${response.data[0].b64_json}`;
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw error;
  }
*/