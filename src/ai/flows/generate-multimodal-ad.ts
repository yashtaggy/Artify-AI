/**
 * generate-multimodal-ad.ts
 *
 * Orchestrator flow for the Multimodal Ad Generator.
 *
 * - Uses helper wrappers in src/lib/gcp-vertex.ts for Vertex/Gemini calls and GCS uploads.
 * - Provides a MOCK mode (set process.env.MOCK_GEN = "true") that returns placeholder images
 *   so you can test the frontend/UI/workflow without spending quota.
 *
 * TODO (integration):
 * - Implement callVisionModel, callImagenModel, callVeoModel to use Vertex/Gemini REST or SDK.
 * - Implement enqueueVideoJob to push job to Cloud Tasks / PubSub / Cloud Run worker.
 */

import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { uploadToBucket, vertexGenerateText } from "../../lib/gcp-vertex";
import { saveGeneratedItem } from "../../lib/saveGeneratedItem"; // optional; adapt if your function differs
import { addJobToQueue } from "../../lib/queue"; // optional placeholder for enqueueing

/* ----------------------------- Types & Payload ---------------------------- */

type BrandBundle = {
  name?: string;
  logoUrl?: string;
  colors?: string[]; // hex strings
  tone?: string; // 'friendly' | 'luxury' | 'playful' etc.
};

type OutputsSpec = {
  images?: string[]; // e.g. ["1080x1080","1920x1080"]
  video?: { enable: boolean; lengthSeconds?: number; aspectRatio?: string };
  platforms?: string[]; // e.g. ["instagram","facebook"]
};

export type GeneratePayload = {
  userId?: string;
  imageUrl: string; // URL to uploaded product image (GCS or remote)
  brief: string; // short description from user
  brand?: BrandBundle;
  outputs?: OutputsSpec;
  options?: { style?: string };
};

type VisionResult = {
  tags: string[];
  dominantColors: string[]; // hex
  description?: string;
  primaryObject?: string;
};

/* ------------------------------- Helpers --------------------------------- */

/** Utility: detect mock mode (local dev) */
const MOCK = process.env.MOCK_GEN === "true";

/** Basic helper to return a placeholder image (public file in /public) */
async function getPlaceholderImageUrl(): Promise<string> {
  // adapt path if your app serves /public/gradient_BG.jpg or similar
  return "/gradient_BG.jpg";
}

/* ------------------------- External model calls -------------------------- */
/* NOTE: Replace the internals of these functions with your actual Vertex/Gemini calls.
   I provide clear placeholders and fallback mocks so you can test immediately.
*/

/** Call a vision/multimodal model (Gemini Vision) to return tags & colors. */
async function callVisionModel(imageUrl: string): Promise<VisionResult> {
  if (MOCK) {
    return {
      tags: ["stainless bottle", "insulated", "metal", "500ml"],
      dominantColors: ["#0a74da", "#ffffff"],
      description: "A stainless steel insulated water bottle with matte finish",
      primaryObject: "water bottle",
    };
  }

  // PRODUCTION: implement a real call to Gemini Vision or Vertex multimodal.
  // Example: use vertexGenerateText with a specialized prompt or call a Vision endpoint.
  // For now, fallback to a safe minimal return to avoid throwing — but you should replace:
  const prompt = `Describe the product in this image and list tags and dominant colors. Image URL: ${imageUrl}`;
  const res = await vertexGenerateText("gemini-vision", prompt).catch((err) => {
    throw new Error("Vision model call failed: " + String(err));
  });

  // Parse res according to response shape from your chosen API
  // This is an example; adapt to the actual response.
  const text = (res?.predictions?.[0]?.content ?? res?.responses?.[0]?.text) || "";
  // naive parse -- prefer structured outputs in real integration
  return {
    tags: text.split(",").slice(0, 6).map((s: string) => s.trim()).filter(Boolean),
    dominantColors: ["#000000"],
    description: text,
    primaryObject: "",
  };
}

/** Call Imagen (image generator) with a prompt and return a public URL (GCS or CDN). */
async function callImagenModel(prompt: string, size: string, seed?: string): Promise<string> {
  if (MOCK) {
    // return the public placeholder from /public so UI can load it
    return await getPlaceholderImageUrl();
  }

  // PRODUCTION: replace this with a call to Imagen/Vertex endpoint that returns binary or base64.
  // Example flow:
  // 1) call Imagen via Vertex REST/SDK with prompt + size
  // 2) receive base64 image -> save to temp file -> uploadToBucket -> return gs:// or https URL
  try {
    // PSEUDO: model call (implement real call)
    const modelResp = await vertexGenerateText("imagen-3", `IMAGE_PROMPT:${prompt}\nSIZE:${size}`);
    // Imagine 'modelResp' contains base64 in modelResp.predictions[0].imageBase64
    const base64 = modelResp?.predictions?.[0]?.imageBase64;
    if (!base64) throw new Error("Imagen response missing image content");

    const buffer = Buffer.from(base64, "base64");
    const tmpName = `/tmp/${uuidv4()}.png`;
    await fs.writeFile(tmpName, buffer);
    const destName = `generated/${Date.now()}_${uuidv4()}.png`;
    const gcsUri = await uploadToBucket(tmpName, destName);
    // Clean tmp file
    await fs.unlink(tmpName).catch(() => {});
    return gcsUri;
  } catch (err) {
    throw new Error("callImagenModel not implemented or failed: " + String(err));
  }
}

/** Request the video generator (Veo) with images + script. Returns jobId or final URL depending on sync/async. */
async function callVeoModelAndReturnUrlOrJob(
  images: string[],
  script: string,
  opts?: { lengthSeconds?: number; voice?: string; aspectRatio?: string }
): Promise<{ jobId?: string; videoUrl?: string }> {
  if (MOCK) {
    // Mock: return placeholder image as "video" poster or a small sample mp4 if you have one.
    return { videoUrl: "/gradient_BG.jpg" };
  }

  // PRODUCTION: you should enqueue or call Veo here. Most likely this will be an async job:
  // - Create a job doc in Firestore
  // - Enqueue job to Cloud Tasks or Pub/Sub with the payload
  // - Return jobId; worker will update doc with video URL after generation
  const jobId = uuidv4();
  try {
    // Example: push to your queue helper
    await addJobToQueue({
      jobId,
      type: "video-generation",
      payload: { images, script, opts },
    });
    return { jobId };
  } catch (err) {
    throw new Error("Failed to enqueue Veo job: " + String(err));
  }
}

/* --------------------------- Prompt templates ---------------------------- */

/** Create image prompts (different styles) using vision results + brief + brand */
function buildImagePrompts(vision: VisionResult, payload: GeneratePayload) {
  const brand = payload.brand ?? {};
  const tone = brand.tone ?? payload.options?.style ?? "clean modern";
  const base = [
    `${vision.description || payload.brief}`,
    `Tags: ${vision.tags.join(", ")}`,
    `Style / tone: ${tone}`,
    brand.name ? `Brand: ${brand.name}` : undefined,
    brand.colors && brand.colors.length ? `Colors: ${brand.colors.join(", ")}` : undefined,
    `Shot: product-focused, clean background, high contrast, studio lighting`,
  ]
    .filter(Boolean)
    .join(" | ");

  // return multiple styles
  return {
    imagePrompts: [
      { label: "lifestyle", prompt: `${base} | lifestyle scene, person holding the product, natural lighting` },
      { label: "minimal", prompt: `${base} | minimalist, negative space, soft shadows, premium look` },
      { label: "hero", prompt: `${base} | close-up hero shot with dramatic lighting, shallow depth of field` },
    ],
    videoScript: `${brand.name ? brand.name + " — " : ""} ${vision.primaryObject || "Product"}: ${payload.brief}. Show product rotating, quick lifestyle cut, end frame CTA: "Shop now".`,
    copyPrompt: `Write 6 ad copy variants (headline + primary text + CTA) for this product. Brief: ${payload.brief}. Tone: ${tone}. Keep lengths: headline <= 10 words, primary <= 90 characters. Return JSON array of objects with keys: headline, text, cta, platform_recommendation.`,
  };
}

/* --------------------------- Main orchestration -------------------------- */

export async function generateMultimodalAd(payload: GeneratePayload) {
  const start = Date.now();
  const jobId = uuidv4();

  // Basic validation
  if (!payload?.imageUrl || !payload?.brief) {
    throw new Error("imageUrl and brief are required in payload");
  }

  // 1) Image understanding
  const vision = await callVisionModel(payload.imageUrl);

  // 2) Build prompts
  const prompts = buildImagePrompts(vision, payload);

  // 3) Generate images (one per prompt & for requested aspect ratios)
  const outputs: { images: { label: string; size: string; url: string }[] } = { images: [] };

  const sizes = payload.outputs?.images?.length ? payload.outputs!.images : ["1080x1080"];
  for (const p of prompts.imagePrompts) {
    for (const size of sizes) {
      try {
        const url = await callImagenModel(p.prompt, size);
        outputs.images.push({ label: p.label, size, url });
      } catch (err) {
        // Fail gracefully: log and continue
        console.error("Image generation failed for prompt:", p.label, size, err);
      }
    }
  }

  // 4) Generate ad copy (Gemini text)
  let copyVariants: any[] = [];
  try {
    const copyResp = await vertexGenerateText("gemini-pro", prompts.copyPrompt);
    // parse response into JSON array if possible. Many LLM responses are text; attempt JSON parse.
    const text =
      copyResp?.predictions?.[0]?.content ??
      copyResp?.responses?.[0]?.output ??
      (copyResp?.outputText || JSON.stringify(copyResp));
    // Try to find JSON in text
    try {
      copyVariants = JSON.parse(text);
      if (!Array.isArray(copyVariants)) throw new Error("not array");
    } catch {
      // fallback: split into lines and create simple variants
      copyVariants = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((t: string) => ({ headline: t.slice(0, 40), text: t.slice(0, 120), cta: "Shop now" }));
    }
  } catch (err) {
    console.error("Copy generation failed:", err);
    copyVariants = [
      { headline: "Try it today", text: payload.brief, cta: "Shop now", platform_recommendation: "instagram" },
    ];
  }

  // 5) If video requested -> enqueue or call Veo
  let videoResult: { jobId?: string; videoUrl?: string } | null = null;
  if (payload.outputs?.video?.enable) {
    const chosenImages = outputs.images.map((i) => i.url).slice(0, 4); // use up to 4 images
    try {
      videoResult = await callVeoModelAndReturnUrlOrJob(chosenImages, prompts.videoScript, {
        lengthSeconds: payload.outputs?.video?.lengthSeconds || 8,
        aspectRatio: payload.outputs?.video?.aspectRatio || "16:9",
      });
    } catch (err) {
      console.error("Video enqueue failed:", err);
    }
  }

  // 6) Persist metadata (optional, use your saveGeneratedItem helper)
  try {
    await saveGeneratedItem({
      jobId,
      userId: payload.userId || null,
      input: { imageUrl: payload.imageUrl, brief: payload.brief, brand: payload.brand, outputs: payload.outputs },
      vision,
      promptsUsed: prompts,
      results: { images: outputs.images, copy: copyVariants, video: videoResult },
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    // Not fatal: warn and continue
    console.warn("Failed to save generated item metadata:", err);
  }

  const elapsed = Date.now() - start;
  return {
    jobId,
    status: payload.outputs?.video?.enable ? "queued" : "complete",
    images: outputs.images,
    copyVariants,
    video: videoResult,
    meta: { model: "gemini+imagen+veo", elapsedMs: elapsed },
  };
}
