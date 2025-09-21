'use server';

import { z } from 'zod';
import { generateProductStory, GenerateProductStoryOutput } from '@/ai/flows/generate-product-story';
import { suggestProductTrends, SuggestProductTrendsOutput } from '@/ai/flows/suggest-product-trends';
import { generateAdCreatives, GenerateAdCreativesOutput } from '@/ai/flows/generate-ad-creatives';
import { AdGeneratorSchema, StoryGeneratorSchema, TrendFinderSchema } from '@/lib/schemas';

export interface StoryGenerationState {
  form: {
    productName: string;
    productDescription: string;
    artisanNotes: string;
  };
  error?: string;
  result?: GenerateProductStoryOutput & { productImageUri: string };
}

export async function handleGenerateStory(
  prevState: StoryGenerationState,
  formData: FormData
): Promise<StoryGenerationState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries()) as Record<string, any>;

    // Validate text fields only
    const validatedFields = StoryGeneratorSchema.omit({ productPhoto: true }).safeParse(rawFormData);
    if (!validatedFields.success) {
      return { ...prevState, error: "Validation failed. Please check your inputs." };
    }

    const { productName, productDescription, artisanNotes } = validatedFields.data;
    const productPhotoDataUri = rawFormData.productPhoto as string | undefined;

    if (!productPhotoDataUri) {
      return { ...prevState, error: "Please upload a valid product photo." };
    }

    const result = await generateProductStory({
      productName,
      productDescription,
      artisanNotes,
      productPhotoDataUri, // already Base64 from UI
    });

    return {
      form: { productName, productDescription, artisanNotes },
      result: { ...result, productImageUri: productPhotoDataUri },
    };
  } catch (e: any) {
    console.error(e);
    return { ...prevState, error: e.message || 'An unexpected error occurred.' };
  }
}

export interface TrendFinderState {
  form: {
    productType: string;
    artisanRegion: string;
  };
  error?: string;
  result?: SuggestProductTrendsOutput;
}

export async function handleSuggestTrends(
  prevState: TrendFinderState,
  formData: FormData
): Promise<TrendFinderState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = TrendFinderSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return { ...prevState, error: "Validation failed. Please check your inputs." };
    }

    const { productType, artisanRegion } = validatedFields.data;
    const result = await suggestProductTrends({ productType, artisanRegion });

    return { form: { productType, artisanRegion }, result };
  } catch (e: any) {
    console.error(e);
    return { ...prevState, error: e.message || 'An unexpected error occurred.' };
  }
}

export interface AdGeneratorState {
  form: {
    productStory: string;
    artisanPreferences: string;
  };
  error?: string;
  result?: GenerateAdCreativesOutput;
}

export async function handleGenerateAds(
  prevState: AdGeneratorState,
  formData: FormData
): Promise<AdGeneratorState> {
  try {
    // Validate only the text fields with Zod
    const validatedFields = AdGeneratorSchema.omit({ productImage: true }).safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      console.error(validatedFields.error);
      return { ...prevState, error: validatedFields.error.issues.map(i => i.message).join(', ') };
    }

    const { productStory, artisanPreferences } = validatedFields.data;

    // Manually get and validate the image data
    const productImageUri = formData.get('productImage') as string | undefined;
    if (!productImageUri) {
      return { ...prevState, error: "Please upload a valid product image." };
    }

    // Call the flow with the validated data
    const result = await generateAdCreatives({
      productStory,
      artisanPreferences,
      productImageUri,
    });

    return { form: { productStory, artisanPreferences }, result };
  } catch (e: any) {
    console.error(e);
    return { ...prevState, error: e.message || 'An unexpected error occurred.' };
  }
}