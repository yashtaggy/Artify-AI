'use server';

import { z } from 'zod';
import { generateProductStory, GenerateProductStoryOutput } from '@/ai/flows/generate-product-story';
import { suggestProductTrends, SuggestProductTrendsOutput } from '@/ai/flows/suggest-product-trends';
import { generateAdCreatives, GenerateAdCreativesOutput } from '@/ai/flows/generate-ad-creatives';
import { AdGeneratorSchema, StoryGeneratorSchema, TrendFinderSchema } from '@/lib/schemas';

// Helper to convert file to data URI
const fileToDataURI = async (file: File): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

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
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = StoryGeneratorSchema.safeParse(rawFormData);
    
    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.flatten().fieldErrors.productPhoto?.[0] || "Validation failed. Please check your inputs.",
      };
    }

    const { productName, productDescription, artisanNotes, productPhoto } = validatedFields.data;
    const photoFile = productPhoto[0] as File;
    const productPhotoDataUri = await fileToDataURI(photoFile);

    const result = await generateProductStory({
      productName,
      productDescription,
      artisanNotes,
      productPhotoDataUri,
    });
    
    return {
      form: { productName, productDescription, artisanNotes },
      result: { ...result, productImageUri: productPhotoDataUri },
    };
  } catch (e: any) {
    console.error(e);
    return {
      ...prevState,
      error: e.message || 'An unexpected error occurred.',
    };
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
      return {
        ...prevState,
        error: "Validation failed. Please check your inputs.",
      };
    }
    
    const { productType, artisanRegion } = validatedFields.data;

    const result = await suggestProductTrends({ productType, artisanRegion });

    return {
      form: { productType, artisanRegion },
      result,
    };
  } catch (e: any) {
    console.error(e);
    return {
      ...prevState,
      error: e.message || 'An unexpected error occurred.',
    };
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
        const rawFormData = Object.fromEntries(formData.entries());
        const validatedFields = AdGeneratorSchema.safeParse(rawFormData);

        if (!validatedFields.success) {
            return {
                ...prevState,
                error: "Validation failed. Please check your inputs.",
            };
        }

        const { productStory, artisanPreferences, productImage } = validatedFields.data;
        const imageFile = productImage[0] as File;
        const productImageUri = await fileToDataURI(imageFile);

        const result = await generateAdCreatives({
            productStory,
            artisanPreferences,
            productImageUri,
        });

        return {
            form: { productStory, artisanPreferences },
            result,
        };
    } catch (e: any) {
        console.error(e);
        return {
            ...prevState,
            error: e.message || 'An unexpected error occurred.',
        };
    }
}
