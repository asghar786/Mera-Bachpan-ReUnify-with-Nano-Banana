
import { GoogleGenAI, Modality } from '@google/genai';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const generateReunionImage = async (
    childPhoto: File,
    adultPhoto: File
): Promise<string> => {
    try {
        const childPhotoBase64 = await fileToBase64(childPhoto);
        const adultPhotoBase64 = await fileToBase64(adultPhoto);

        const prompt = `You are a photo editing expert. Your task is to merge two photographs into a single, heartwarming image. The first image is a childhood photo, and the second is a recent photo of the same person as an adult. Create a new image where the adult from the recent photo is gently hugging the child from the childhood photo. Ensure the interaction looks natural and emotionally resonant. Both figures should be clearly visible and well-integrated. Replace the original backgrounds entirely with a seamless, soft, and smooth off-white studio background. Apply natural, soft lighting to create a tender and nostalgic mood. The final output should be a single, photorealistic image.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: childPhotoBase64, mimeType: childPhoto.type } },
                    { inlineData: { data: adultPhotoBase64, mimeType: adultPhoto.type } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];

        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }

        throw new Error('Could not extract image data from the API response.');
    } catch (error) {
        console.error('Error generating image with Gemini:', error);
        throw new Error('Failed to generate the image. The model may be unavailable or the request may have been blocked.');
    }
};
