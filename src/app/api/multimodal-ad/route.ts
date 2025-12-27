import { NextResponse } from "next/server";
import { generateMultimodalAd } from "../../../ai/flows/generate-multimodal-ad";

export async function POST(req: Request) {
  const body = await req.json();
  // Basic validation...
  const result = await generateMultimodalAd(body);
  return NextResponse.json({ ok: true, result });
}
