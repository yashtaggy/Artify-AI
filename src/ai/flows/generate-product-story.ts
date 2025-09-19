'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating product stories.
 *
 * - generateProductStory - A function that takes product details (photos, notes) and generates compelling product descriptions, social media posts, and a provenance card.
 * - GenerateProductStoryInput - The input type for the generateProductStory function.
 * - GenerateProductStoryOutput - The return type for the generateProductStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductStoryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product, including materials, techniques, and region of origin.'),
  productPhotoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  artisanNotes: z.string().describe('Additional notes from the artisan about the product, its creation, or its story.'),
  regionalData: z.string().optional().describe('Optional regional or heritage data associated with the product.'),
  heritageData: z.string().optional().describe('Optional heritage information related to the product.'),
});
export type GenerateProductStoryInput = z.infer<typeof GenerateProductStoryInputSchema>;

const GenerateProductStoryOutputSchema = z.object({
  productDescriptionShort: z.string().describe('A short, compelling description of the product.'),
  productDescriptionLong: z.string().describe('A longer, more detailed description of the product.'),
  socialMediaPost: z.string().describe('A social media post (e.g., Instagram Reel caption, Twitter/X post) promoting the product.'),
  provenanceCardContent: z.string().describe('Content for a digital provenance card.'),
});
export type GenerateProductStoryOutput = z.infer<typeof GenerateProductStoryOutputSchema>;

export async function generateProductStory(input: GenerateProductStoryInput): Promise<GenerateProductStoryOutput> {
  return generateProductStoryFlow(input);
}

const generateProductStoryFlow = ai.defineFlow(
  {
    name: 'generateProductStoryFlow',
    inputSchema: GenerateProductStoryInputSchema,
    outputSchema: GenerateProductStoryOutputSchema,
  },
  async input => {
    const {output} = await generateProductStoryPrompt(input);
    return output!;
  }
);

const generateProductStoryPrompt = ai.definePrompt({
  name: 'generateProductStoryPrompt',
  input: {schema: GenerateProductStoryInputSchema},
  output: {schema: GenerateProductStoryOutputSchema},
  prompt: `You are an expert storyteller and marketing assistant for artisans.

You will be given details about a handmade product. Your task is to generate compelling marketing content that tells the product's story.

Here are the details for the product:
- Name: {{{productName}}}
- Core Details: {{{productDescription}}}
- Artisan's Notes: {{{artisanNotes}}}
{{#if regionalData}}- Regional Information: {{{regionalData}}}{{/if}}
{{#if heritageData}}- Heritage Information: {{{heritageData}}}{{/if}}
- Product Photo: {{media url=productPhotoDataUri}}

Based on these details, please generate the following:
1.  **productDescriptionShort**: A catchy, one-sentence description.
2.  **productDescriptionLong**: A detailed, evocative description that weaves in details about the creation process, materials, and cultural significance.
3.  **socialMediaPost**: A ready-to-use post for social media (like Instagram or Facebook), including hashtags.
4.  **provenanceCardContent**: A concise and inspiring story for a digital provenance card that connects the customer to the artisan and the product's origin. This should be a short paragraph.

Ensure the tone is authentic, warm, and highlights the unique value of a handcrafted item.
`,
});
