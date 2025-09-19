'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting product trends to artisans.
 *
 * The flow analyzes Google Trends and shopping data based on the artisan's product type and region to suggest new product variations and SEO-friendly keywords.
 *
 * @fileOverview
 * - suggestProductTrends - A function that suggests product trends based on input.
 * - SuggestProductTrendsInput - The input type for the suggestProductTrends function.
 * - SuggestProductTrendsOutput - The return type for the suggestProductTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductTrendsInputSchema = z.object({
  productType: z.string().describe('The type of product the artisan creates (e.g., pottery, jewelry).'),
  artisanRegion: z.string().describe('The region where the artisan is located.'),
});
export type SuggestProductTrendsInput = z.infer<typeof SuggestProductTrendsInputSchema>;

const SuggestProductTrendsOutputSchema = z.object({
  suggestedVariations: z.array(z.string()).describe('Suggestions for new product variations based on trend analysis.'),
  seoKeywords: z.array(z.string()).describe('SEO-friendly keywords for maximum product discovery.'),
  marketTrends: z.string().describe('A summary of the relevant market trends driving the suggestions.'),
});
export type SuggestProductTrendsOutput = z.infer<typeof SuggestProductTrendsOutputSchema>;

export async function suggestProductTrends(input: SuggestProductTrendsInput): Promise<SuggestProductTrendsOutput> {
  return suggestProductTrendsFlow(input);
}

const suggestProductTrendsPrompt = ai.definePrompt({
  name: 'suggestProductTrendsPrompt',
  input: {schema: SuggestProductTrendsInputSchema},
  output: {schema: SuggestProductTrendsOutputSchema},
  prompt: `You are an AI assistant that helps artisans identify product trends and SEO keywords.

  Analyze Google Trends and shopping data based on the artisan's product type and region to suggest new product variations and SEO-friendly keywords.

  Artisan Product Type: {{{productType}}}
  Artisan Region: {{{artisanRegion}}}

  Provide a summary of the market trends that you see and use as the basis for the suggestions.
  Output suggested product variations and SEO keywords the artisan can use to improve sales.
  Ensure that the keywords are relevant to the region of the artisan.

  Format your response as a JSON object that matches the schema exactly.
  Do not include any other text besides the JSON object.
  `,
});

const suggestProductTrendsFlow = ai.defineFlow(
  {
    name: 'suggestProductTrendsFlow',
    inputSchema: SuggestProductTrendsInputSchema,
    outputSchema: SuggestProductTrendsOutputSchema,
  },
  async input => {
    const {output} = await suggestProductTrendsPrompt(input);
    return output!;
  }
);
