/**
 * src/lib/gcp-vertex.ts
 *
 * Vertex generative helpers for Artify AI.
 *
 * Requirements:
 *  - npm install google-auth-library @google-cloud/storage node-fetch uuid
 *  - Set GOOGLE_PROJECT_ID and ARTIFY_GCP_STORAGE_BUCKET in .env.local
 *  - Create Vertex endpoints in your GCP project for the models you want to use
 *    (Gemini text/vision, Imagen, Veo) and set the endpoint resource names in env:
 *      VERTEX_ENDPOINT_TEXT
 *      VERTEX_ENDPOINT_VISION
 *      VERTEX_ENDPOINT_IMAGEN
 *      VERTEX_ENDPOINT_VEO
 *
 * Notes:
 *  - This file uses the Vertex REST :predict endpoint:
 *      POST https://<region>-aiplatform.googleapis.com/v1/{endpoint}:predict
 *  - For auth it uses Application Default Credentials via google-auth-library.
 *  - The exact response shape depends on the model/endpoint. You may need to adapt the parsing logic.
 */

import fs from "fs/promises";
import os from "os";
import path from "path";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

const PROJECT = process.env.GOOGLE_PROJECT_ID || "";
const BUCKET = process.env.ARTIFY_GCP_STORAGE_BUCKET || "";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1"; // adapt if needed

// Vertex endpoint resource strings (set these in env after creating endpoints in console)
// Example value: "projects/your-project/locations/us-central1/endpoints/1234567890123456789"
const VERTEX_ENDPOINT_TEXT = process.env.VERTEX_ENDPOINT_TEXT || "";
const VERTEX_ENDPOINT_VISION = process.env.VERTEX_ENDPOINT_VISION || "";
const VERTEX_ENDPOINT_IMAGEN = process.env.VERTEX_ENDPOINT_IMAGEN || "";
const VERTEX_ENDPOINT_VEO = process.env.VERTEX_ENDPOINT_VEO || "";

if (!PROJECT) {
  console.warn("GOOGLE_PROJECT_ID not set. Vertex requests will fail until this is configured.");
}

if (!BUCKET) {
  console.warn("ARTIFY_GCP_STORAGE_BUCKET not set. Uploads will fail until this is configured.");
}

const storage = new Storage();

/* --------------------- Auth helper --------------------- */

async function getAccessToken(): Promise<string> {
  // Uses Application Default Credentials (ADC) if available; falls back to service account key
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse || !tokenResponse.token) {
    throw new Error("Failed to obtain access token from ADC");
  }
  return tokenResponse.token;
}

/* --------------------- Generic Vertex predict --------------------- */

/**
 * Make a predict call to a Vertex endpoint.
 * @param endpointResource string - full resource path for endpoint, e.g. projects/.../locations/.../endpoints/ID
 * @param instances any[] - instances array for the model
 * @param parameters object (optional) - parameters for the model
 */
export async function vertexPredict(endpointResource: string, instances: any[], parameters?: any) {
  if (!endpointResource) throw new Error("endpointResource is required");
  const token = await getAccessToken();
  // determine service endpoint host from endpointResource -> use region from endpointResource or default
  // We'll call the generic service endpoint for the region in LOCATION
  const serviceHost = `${LOCATION}-aiplatform.googleapis.com`;
  const url = `https://${serviceHost}/v1/${endpointResource}:predict`;
  const body = { instances, parameters: parameters ?? {} };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vertex predict failed (${res.status}): ${txt}`);
  }
  const data = await res.json();
  return data;
}

/* --------------------- Specific helpers --------------------- */

/** Simple wrapper to call text/generative endpoint (Gemini) */
export async function vertexGenerateText(prompt: string, opts?: { maxTokens?: number; temperature?: number }) {
  if (!VERTEX_ENDPOINT_TEXT) throw new Error("VERTEX_ENDPOINT_TEXT env missing");
  // Instances shape may vary by model; many generative endpoints accept {input: "..."} or {content: "..."}
  const instances = [{ input: prompt }];
  const parameters = { temperature: opts?.temperature ?? 0.9, maxOutputTokens: opts?.maxTokens ?? 512 };
  return await vertexPredict(VERTEX_ENDPOINT_TEXT, instances, parameters);
}

/** Call vision endpoint (Gemini Vision) to analyze an image. Provide image as URL or GCS path. */
export async function callVisionEndpoint(imageUrl: string) {
  if (!VERTEX_ENDPOINT_VISION) throw new Error("VERTEX_ENDPOINT_VISION env missing");
  const instances = [
    {
      input: {
        mime_type: "image/jpeg",
        content: imageUrl, // prefer a publicly accessible URL or gs:// path depending on endpoint config
      },
    },
  ];
  const resp = await vertexPredict(VERTEX_ENDPOINT_VISION, instances, {});
  return resp;
}

/** Call Imagen endpoint to generate an image and return the public GCS URL.
 *  This function expects the model to return image bytes/base64 in a predictable field; adapt parsing if needed.
 */
export async function callImagenEndpoint(prompt: string, size = "1024x1024"): Promise<string> {
  if (!VERTEX_ENDPOINT_IMAGEN) throw new Error("VERTEX_ENDPOINT_IMAGEN env missing");
  const instances = [
    {
      input: {
        prompt,
        size,
      },
    },
  ];
  const resp = await vertexPredict(VERTEX_ENDPOINT_IMAGEN, instances, {});
  // Response shapes vary. Check console or response and adapt.
  // Common pattern: resp.predictions[0].content or resp.predictions[0].imageBase64
  const base64 =
    resp?.predictions?.[0]?.imageBase64 ?? resp?.predictions?.[0]?.content ?? resp?.predictions?.[0]?.image;
  if (!base64) {
    // If response contains a URL already (depends on model), return that
    const maybeUrl = resp?.predictions?.[0]?.gcsUri ?? resp?.predictions?.[0]?.url;
    if (maybeUrl) return maybeUrl;
    throw new Error("Imagen endpoint returned no base64 image (inspect resp).");
  }

  // If base64 appears to be an object (sometimes nested), convert accordingly
  const b64string = typeof base64 === "string" ? base64 : base64?.data ?? null;
  if (!b64string) throw new Error("No base64 string found in imagen response.");

  // write to a temp file
  const tmpPath = path.join(os.tmpdir(), `${uuidv4()}.png`);
  await fs.writeFile(tmpPath, Buffer.from(b64string, "base64"));

  // upload to bucket
  const destName = `generated/${Date.now()}_${uuidv4()}.png`;
  const gcsUrl = await uploadToBucket(tmpPath, destName);

  // cleanup
  await fs.unlink(tmpPath).catch(() => {});
  return gcsUrl;
}

/** Call Veo (video generation) endpoint - may be async or return gcsUri directly.
 *  Instances shape depends on model. A typical instance might include: { prompt, images: [urls], lengthSeconds, aspectRatio, voice }
 */
export async function callVeoEndpoint(opts: {
  prompt: string;
  images?: string[];
  lengthSeconds?: number;
  aspectRatio?: string;
  voice?: string;
}) {
  if (!VERTEX_ENDPOINT_VEO) throw new Error("VERTEX_ENDPOINT_VEO env missing");
  const instances = [
    {
      input: {
        prompt: opts.prompt,
        images: opts.images ?? [],
        lengthSeconds: opts.lengthSeconds ?? 8,
        aspectRatio: opts.aspectRatio ?? "16:9",
        voice: opts.voice ?? "en-US-Wavenet-F",
      },
    },
  ];
  const resp = await vertexPredict(VERTEX_ENDPOINT_VEO, instances, {});
  // resp may contain job id or gcsUri depending on model configuration.
  // Try to parse common fields:
  const jobId = resp?.predictions?.[0]?.jobId ?? resp?.jobId;
  const gcsUri = resp?.predictions?.[0]?.gcsUri ?? resp?.predictions?.[0]?.videoGcsUri ?? resp?.predictions?.[0]?.url;
  return { resp, jobId, gcsUri };
}

/* --------------------- Storage helpers --------------------- */

/** Upload a local file to the configured GCS bucket and return a gs:// URI or an https URL depending on your choice */
export async function uploadToBucket(localPath: string, destName: string) {
  if (!BUCKET) throw new Error("ARTIFY_GCP_STORAGE_BUCKET not configured");
  const bucket = storage.bucket(BUCKET);
  await bucket.upload(localPath, { destination: destName, resumable: false });
  // Make object publicly readable (optional) or rely on signed URLs
  await bucket.file(destName).makePublic().catch(() => {
    // ignore permission errors — you might prefer signed URLs in prod.
  });
  // return https URL to the object
  return `https://storage.googleapis.com/${BUCKET}/${destName}`;
}

/* --------------------- Utility: get signed URL --------------------- */

export async function getSignedUrlForGcsObject(destName: string, expiresInSec = 3600) {
  if (!BUCKET) throw new Error("ARTIFY_GCP_STORAGE_BUCKET not configured");
  const file = storage.bucket(BUCKET).file(destName);
  const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + expiresInSec * 1000 });
  return url;
}
