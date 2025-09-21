// E:\Projects\CraftGenie\src\lib\schemas.ts

import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const StoryGeneratorSchema = z.object({
  productName: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  productDescription: z.string().min(20, { message: 'Product description must be at least 20 characters.' }),
  artisanNotes: z.string().optional(),
  productPhoto: z.any()
    .refine((file) => file, 'Product photo is required.')
    .refine((file) => file?.size <= MAX_IMAGE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

export type StoryGeneratorInput = z.infer<typeof StoryGeneratorSchema>;

export const TrendFinderSchema = z.object({
  productType: z.string().min(3, { message: 'Product type must be at least 3 characters.' }),
  artisanRegion: z.string().min(3, { message: 'Artisan region must be at least 3 characters.' }),
});

export type TrendFinderInput = z.infer<typeof TrendFinderSchema>;

// Updated AdGeneratorSchema to validate a Base64 string instead of a File object
export const AdGeneratorSchema = z.object({
  productStory: z.string().min(50, { message: 'Product story must be at least 50 characters.' }),
  artisanPreferences: z.string().min(10, { message: 'Artisan preferences must be at least 10 characters.' }),
  productImage: z.string()
    .min(1, { message: 'Product image is required.' })
    .refine((value) => {
      // Check for valid Base64 format and size
      const base64Content = value.split(',')[1];
      if (!base64Content) return false;

      const sizeInBytes = (base64Content.length * 0.75) - 2; // Estimate size from Base64 string
      return sizeInBytes <= MAX_IMAGE_SIZE;
    }, 'Max image size is 5MB.')
    .refine((value) => {
      // Check for accepted image types from the MIME type in the data URI
      const mimeType = value.split(';')[0].split(':')[1];
      return ACCEPTED_IMAGE_TYPES.includes(mimeType);
    }, '.jpg, .jpeg, .png and .webp files are accepted.'),
});

export type AdGeneratorInput = z.infer<typeof AdGeneratorSchema>;