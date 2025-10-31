"use server"; // 🩵 Add this at the very top (ensures server-only execution)

import { NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";
import { vertex } from "@/lib/vertex-server";

// ✅ Initialize Google Cloud Translation client (safe at top level)
const translationClient = new TranslationServiceClient({
  keyFilename: "./key/vertex-translation.json",
});

const projectId = "artifyai-891ba";
const location = "global";

// ✅ Remove top-level await here (move it inside the handler)

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing 'text' or 'targetLanguage' in request body." },
        { status: 400 }
      );
    }

    // ✅ Perform translation
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLanguage,
    };

    const [translationResponse] = await translationClient.translateText(request);
    const translatedText = translationResponse.translations?.[0]?.translatedText || "";

    // ✅ Call Vertex AI model *only inside* handler
    const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });
    const aiResponse = await model.generateContent(
      `Improve translation quality: ${translatedText}`
    );

    return NextResponse.json({
      translatedText,
      aiEnhancement: aiResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text || "",
    });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
