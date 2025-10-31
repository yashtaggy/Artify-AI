"use server"; // 🩵 Add this at the very top

import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import { vertex } from "@/lib/vertex-server";

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: "./key/vertex-translation.json",
});

// ✅ Remove the top-level Vertex AI call here

export async function POST(req: Request) {
  try {
    const { text, languageCode } = await req.json();
    if (!text)
      return NextResponse.json({ error: "Missing text" }, { status: 400 });

    // ✅ Generate speech with Google TTS
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: languageCode || "en-US", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    });

    // ✅ Optionally: use Vertex AI inside the handler (runtime only)
    const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });
    const aiResponse = await model.generateContent(
      `Summarize or caption this speech: ${text}`
    );

    const audioBase64 = response.audioContent?.toString("base64");
    return NextResponse.json({
      audioBase64,
      aiCaption: aiResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text || "",
    });
  } catch (err: any) {
    console.error("Text-to-Speech Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
