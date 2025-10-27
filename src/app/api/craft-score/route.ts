import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai"; 

// Initialize the client globally, but ensure the key check is robust
const COHERE_API_KEY = process.env.COHERE_API_KEY;
// We initialize the client with the key, but we will handle the error *inside* the POST
// so we don't crash the entire server instance during startup if the key is missing.
const cohere = COHERE_API_KEY ? new CohereClient({ token: COHERE_API_KEY }) : null;

export async function POST(req: Request) {
  // CRITICAL: Check the API key and the client instance
  if (!COHERE_API_KEY || !cohere) {
    console.error("CONFIGURATION ERROR: COHERE_API_KEY environment variable is missing or invalid.");
    return NextResponse.json(
      { error: "Server Configuration Error: Cohere API Key is missing. Please set COHERE_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    // 1. Destructure and apply safe defaults and type coercion immediately
    const productName = body.productName || "Handicraft";
    const productDesc = body.productDesc || "A beautiful handmade item.";
    // Ensure materials is an array, defaulting to empty if missing
    const materials: string[] = Array.isArray(body.materials) ? body.materials : [];
    const safeOrigin = body.origin || 'Local';

    // Coerce numeric inputs to numbers, defaulting to 0 if NaN or missing
    const materialCost = Number(body.materialCost) || 0;
    const hoursSpent = Number(body.hoursSpent) || 0;
    const demandLevel = body.demandLevel || "Medium";
    const safeEnergyUsed = Number(body.energyUsed) || 0;
    const safeProductionHours = Number(body.productionHours) || 0;

    // --- Pricing logic ---
    const base = materialCost + hoursSpent * 150; 
    const multiplier =
      demandLevel === "High" ? 1.4 : demandLevel === "Medium" ? 1.2 : 1.0;
    const suggestedPrice = base * multiplier;
    const negotiationRange = [suggestedPrice * 0.95, suggestedPrice * 1.15];

    // --- Sustainability logic ---
    const ecoMaterials = ["Recycled Paper", "Natural Fibers", "Wood", "Clay"];
    
    // Calculate ecoScore: if materials array is empty, default to 50
    const ecoScore =
      materials.length > 0
        ? materials.reduce(
            (acc: number, m: string) =>
              acc + (ecoMaterials.includes(m) ? 80 : 40),
            0
          ) / materials.length
        : 50;

    // Use safe defaults in calculations
    const originFactor = safeOrigin === "Local" ? 1.0 : 0.8;
    const energyFactor = Math.max(0.3, 1 - safeEnergyUsed / 200);
    const timeFactor = Math.max(0.4, 1 - safeProductionHours / 100);
    
    // Ensure carbonFootprint calculation is safe
    const carbonFootprint = parseFloat((safeEnergyUsed * (safeOrigin === "Imported" ? 1.2 : 0.8)).toFixed(2));
    const totalScore = ecoScore * originFactor * energyFactor * timeFactor;

    // --- Cohere AI Chat Prompt Construction ---
    const chatPrompt = `
You are an AI sustainability and pricing assistant for handmade products.
Product Name: ${productName}
Description: ${productDesc}
Materials: ${materials.join(', ')}
Origin: ${safeOrigin}
Material Cost: ₹${materialCost}
Hours Spent: ${hoursSpent}
Market Demand: ${demandLevel}
Energy Used: ${safeEnergyUsed} kWh
Production Time: ${safeProductionHours} hours

Suggest ways to improve sustainability, reduce carbon footprint, and optimize pricing.
`;

    // --- Cohere AI Chat Call ---
    const response = await cohere.chat({
      model: "command-xlarge-nightly", 
      message: chatPrompt, 
      maxTokens: 300, 
      temperature: 0.7,
    });

    const suggestion = response?.text || "No suggestions generated.";

    return NextResponse.json({
      suggestedPrice,
      negotiationRange,
      ecoScore,
      carbonFootprint,
      totalScore,
      suggestion,
    });
  } catch (error) {
    // Log the detailed error from Cohere (which often has more info)
    console.error("Craft Score API Error (Cohere or Math failure):", error);
    // Return a generic 500 error for security and to allow the client to handle it.
    return NextResponse.json({ error: "Internal Server Error during Craft Score calculation. Check server logs for Cohere API errors." }, { status: 500 });
  }
}
