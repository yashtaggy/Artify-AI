'use server';

/**
 * @fileOverview Defines the Genkit flow for generating ad creatives with fallback handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAdCreativesInputSchema = z.object({
  productStory: z.string().describe('The AI-generated story of the product.'),
  artisanPreferences: z.string().describe('Artisan preferences regarding target audience, budget, and ad format.'),
  productImageUri: z.string().describe('Base64 encoded product image with MIME type.'),
});

export type GenerateAdCreativesInput = z.infer<typeof GenerateAdCreativesInputSchema>;

const GenerateAdCreativesOutputSchema = z.object({
  youtubeShort: z.string(),
  instagramReel: z.string(),
  googleAdBanner: z.string(),
  audienceTargeting: z.string(),
  budgetOptimization: z.string(),
});

export type GenerateAdCreativesOutput = z.infer<typeof GenerateAdCreativesOutputSchema>;

export async function generateAdCreatives(
  input: GenerateAdCreativesInput
): Promise<GenerateAdCreativesOutput> {
  try {
    // Check if ai is properly configured
    if (!ai || !ai.definePrompt) {
      console.warn('⚠️ Genkit not initialized properly. Returning mock response.');
      return mockAdResponse(input);
    }

    const adCreativesPrompt = ai.definePrompt({
      name: 'adCreativesPrompt',
      input: { schema: GenerateAdCreativesInputSchema },
      output: { schema: GenerateAdCreativesOutputSchema },
      prompt: `
        You are a professional marketing copywriter.
        Using the details below, generate three short ad creatives and marketing insights.

        Product Story: {{{productStory}}}
        Artisan Preferences: {{{artisanPreferences}}}
        Product Image: {{media url=productImageUri}}

        Output structured results for:
        - YouTube Short (engaging 10-15s caption)
        - Instagram Reel (hook + short copy)
        - Google Ad Banner (headline + subline)
        - Audience Targeting (who to show this to)
        - Budget Optimization (how to spend effectively)
      `,
    });

    const flow = ai.defineFlow(
      {
        name: 'generateAdCreativesFlow',
        inputSchema: GenerateAdCreativesInputSchema,
        outputSchema: GenerateAdCreativesOutputSchema,
      },
      async inputData => {
        const { output } = await adCreativesPrompt(inputData);
        return output!;
      }
    );

    const output = await flow(input);
    return output;
  } catch (err: any) {
    console.error('❌ AI generation failed:', err);
    // Return fallback data so the UI doesn’t break
    return mockAdResponse(input);
  }
}

// --- Mock fallback in case AI/Genkit fails ---
function mockAdResponse(input: GenerateAdCreativesInput): GenerateAdCreativesOutput {
  return {
    youtubeShort: `✨ Showcasing your product: ${input.productStory.slice(0, 60)}...`,
    instagramReel: `🎬 Trendy reel idea for ${input.artisanPreferences.slice(0, 60)}...`,
    googleAdBanner: `🛍️ ${input.productStory.split(' ')[0]} — the next must-have item!`,
    audienceTargeting: `Ideal for ${input.artisanPreferences || 'your target audience'}.`,
    budgetOptimization: 'Start small and increase spend based on engagement rates.',
  };
}
