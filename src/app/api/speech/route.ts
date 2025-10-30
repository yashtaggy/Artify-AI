// app/api/speech/route.ts
import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: "./key/vertex-translation.json",
});

export async function POST(req: Request) {
  try {
    const { text, languageCode } = await req.json();
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: languageCode || "en-US", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    });

    const audioBase64 = response.audioContent?.toString("base64");
    return NextResponse.json({ audioBase64 });
  } catch (err: any) {
    console.error("Text-to-Speech Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
