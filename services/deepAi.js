import Constants from "expo-constants";

const { deepAiApiKey } = Constants.expoConfig.extra;

export async function generateImageFromPrompt(prompt) {
  try {
    const params = {
      method: 'POST',
      headers: {
        'api-key': deepAiApiKey,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
            text: prompt,
        })
    }
    const response = await fetch('https://api.deepai.org/api/text2img', params);

    if (!response.ok) {
      throw new Error(`DeepAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.output_url; // Direct URL to the generated image
  } catch (error) {
    console.error('DeepAI image generation error:', error);
    throw error;
  }
}