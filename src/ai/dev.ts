import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-product-trends.ts';
import '@/ai/flows/generate-ad-creatives.ts';
import '@/ai/flows/generate-product-story.ts';