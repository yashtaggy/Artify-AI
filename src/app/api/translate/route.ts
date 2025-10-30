import { NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";

// ✅ Initialize Google Cloud Translation client
const translationClient = new TranslationServiceClient({
  keyFilename: "./key/vertex-translation.json",
});

// ✅ Define your project & location
const projectId = "artifyai-891ba"; // <-- replace if different
const location = "global";

// ✅ POST handler
export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing 'text' or 'targetLanguage' in request body." },
        { status: 400 }
      );
    }

    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLanguage,
    };

    // ✅ Perform translation
    const [response] = await translationClient.translateText(request);

    const translatedText = response.translations?.[0]?.translatedText || "";

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
