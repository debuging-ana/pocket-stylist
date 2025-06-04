import OpenAI from 'openai';
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
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });
    return `data:image/png;base64,${response.data[0].b64_json}`;
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw error;
  }
}