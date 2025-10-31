// src/lib/vertex-server.ts
import { VertexAI } from "@google-cloud/vertexai";

// Parse credentials only if available (in Cloud Run / env vars)
const credentials: Record<string, string> | undefined =
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string)
    : undefined;

// Initialize Vertex AI
export const vertex = new VertexAI({
  project: "artifyai-891ba",
  location: "asia-south1",
  ...(credentials && { credentials }), // only include if defined
});
