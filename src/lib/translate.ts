import { TranslationServiceClient } from "@google-cloud/translate";
import path from "path";

const translationClient = new TranslationServiceClient({
  keyFilename: path.join(process.cwd(), "./key/vertex-translation.json"),
});

const projectId = "artifyai-891ba"; // your project ID
const location = "global"; // or "us-central1"

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);
    const translated = response.translations?.[0]?.translatedText || "";
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
