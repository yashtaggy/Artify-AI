import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const cohere = COHERE_API_KEY ? new CohereClient({ token: COHERE_API_KEY }) : null;

export async function POST(req: Request) {
  if (!COHERE_API_KEY || !cohere) {
    console.error("❌ Missing Cohere API key. Please set COHERE_API_KEY in .env.local");
    return NextResponse.json(
      { error: "Server Configuration Error: Missing Cohere API Key." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { productName } = body;

    if (!productName || productName.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid product name. Please enter a valid product name." },
        { status: 400 }
      );
    }

    // Step 1: Validate product existence
    const validationPrompt = `
    You are a global market research AI. Check if the product "${productName}" exists as a real consumer or industrial product.
    Respond ONLY in JSON:
    {
      "exists": true/false,
      "confidence": 1-10,
      "reason": "short reason explaining your decision"
    }`;

    const validationRes = await cohere.chat({
      model: "command-xlarge-nightly",
      message: validationPrompt,
      temperature: 0.3,
    });

    const validationText = validationRes?.text?.trim() || "";
    const jsonStart = validationText.indexOf("{");
    const jsonEnd = validationText.lastIndexOf("}");
    const validation = JSON.parse(validationText.slice(jsonStart, jsonEnd + 1));

    if (!validation.exists || validation.confidence < 5) {
      return NextResponse.json(
        {
          error: `The product "${productName}" does not appear to exist in the global market.`,
          reason: validation.reason || "Unknown reason",
        },
        { status: 400 }
      );
    }

    // Step 2: Perform demand analysis
    const analysisPrompt = `
    You are an expert market analyst. Analyze the global market demand trend for "${productName}".
    Respond ONLY in JSON:
    {
      "historical_data": {
        "2019": number,
        "2020": number,
        "2021": number,
        "2022": number,
        "2023": number,
        "2024": number
      },
      "forecast_data": {
        "2025": number,
        "2026": number,
        "2027": number,
        "2028": number,
        "2029": number
      },
      "competitors": ["list of competitors"],
      "regions": ["top 5 regions with high demand"],
      "insights": "short summary of the market trend",
      "tips": ["5 short practical business tips"]
    }`;

    const analysisRes = await cohere.chat({
      model: "command-xlarge-nightly",
      message: analysisPrompt,
      temperature: 0.6,
    });

    const analysisText = analysisRes?.text?.trim() || "";
    const startIdx = analysisText.indexOf("{");
    const endIdx = analysisText.lastIndexOf("}");
    const data = JSON.parse(analysisText.slice(startIdx, endIdx + 1));

    return NextResponse.json({
      productName,
      validation,
      data,
    });
  } catch (error) {
    console.error("⚠️ Market Demand API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during Market Demand analysis." },
      { status: 500 }
    );
  }
}
