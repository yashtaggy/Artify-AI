import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const StoryGeneratorSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters."),
  productDescription: z.string().min(10, "Product description is too short."),
  artisanNotes: z.string().optional(),
  productPhoto: z
    .any()
    .refine((files) => files?.length == 1, "Product photo is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});
export type StoryGeneratorInput = z.infer<typeof StoryGeneratorSchema>;

export const TrendFinderSchema = z.object({
    productType: z.string().min(2, "Product type is required."),
    artisanRegion: z.string().min(2, "Region is required."),
});
export type TrendFinderInput = z.infer<typeof TrendFinderSchema>;


export const AdGeneratorSchema = z.object({
  productStory: z.string().min(10, "Product story is required."),
  artisanPreferences: z.string().min(10, "Artisan preferences are required."),
   productImage: z
    .any()
    .refine((files) => files?.length == 1, "Product image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});
export type AdGeneratorInput = z.infer<typeof AdGeneratorSchema>;
