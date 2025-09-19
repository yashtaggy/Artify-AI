// src/ai/flows/generate-ad-creatives.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating ad creatives, including social media posts and ad banners, with audience targeting and budget optimization suggestions.
 *
 * - generateAdCreatives - A function that takes product stories and artisan preferences as input and generates ad creatives.
 * - GenerateAdCreativesInput - The input type for the generateAdCreatives function.
 * - GenerateAdCreativesOutput - The return type for the generateAdCreatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the generateAdCreatives flow
const GenerateAdCreativesInputSchema = z.object({
  productStory: z.string().describe('The AI-generated story of the product.'),
  artisanPreferences: z
    .string()
    .describe(
      'Artisan preferences regarding target audience, budget, and ad format.'
    ),
  productImageUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateAdCreativesInput = z.infer<
  typeof GenerateAdCreativesInputSchema
>;

// Output schema for the generateAdCreatives flow
const GenerateAdCreativesOutputSchema = z.object({
  youtubeShort: z.string().describe('Generated YouTube Shorts ad creative.'),
  instagramReel: z.string().describe('Generated Instagram Reels ad creative.'),
  googleAdBanner: z.string().describe('Generated Google Ads banner creative.'),
  audienceTargeting: z
    .string()
    .describe('AI-driven audience targeting suggestions.'),
  budgetOptimization: z
    .string()
    .describe('Budget optimization suggestions for the ad campaign.'),
});

export type GenerateAdCreativesOutput = z.infer<
  typeof GenerateAdCreativesOutputSchema
>;

// Main function to generate ad creatives
export async function generateAdCreatives(
  input: GenerateAdCreativesInput
): Promise<GenerateAdCreativesOutput> {
  return generateAdCreativesFlow(input);
}

// Define the prompt for generating ad creatives
const adCreativesPrompt = ai.definePrompt({
  name: 'adCreativesPrompt',
  input: {schema: GenerateAdCreativesInputSchema},
  output: {schema: GenerateAdCreativesOutputSchema},
  prompt: `You are an AI marketing expert specializing in creating ad creatives for artisans.

  Given the following product story, artisan preferences, and product image, generate ad creatives for YouTube Shorts, Instagram Reels, and Google Ads banners. Also, provide audience targeting and budget optimization suggestions.

  Product Story: {{{productStory}}}
  Artisan Preferences: {{{artisanPreferences}}}
  Product Image: {{media url=productImageUri}}

  Output ad creatives, audience targeting, and budget optimization to maximize artisan's reach and sales.
`,
});

// Define the Genkit flow for generating ad creatives
const generateAdCreativesFlow = ai.defineFlow(
  {
    name: 'generateAdCreativesFlow',
    inputSchema: GenerateAdCreativesInputSchema,
    outputSchema: GenerateAdCreativesOutputSchema,
  },
  async input => {
    const {output} = await adCreativesPrompt(input);
    return output!;
  }
);
