'use client';

import { useActionState, useEffect, useRef, useState, type FC } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Loader2, Sparkles, Upload, Save } from 'lucide-react';
import * as htmlToImage from 'html-to-image'; // 🔥 Added for download feature
import type { StoryGenerationState } from '@/app/actions';
import { handleGenerateStory } from '@/app/actions';
import { StoryGeneratorSchema } from '@/lib/schemas';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ProvenanceCard } from '../provenance-card';
import { Separator } from '../ui/separator';
import { saveGeneratedItem } from '@/lib/saveGeneratedItem';

const initialState: StoryGenerationState = {
  form: {
    productName: '',
    productDescription: '',
    artisanNotes: '',
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2" />
          Generate Story
        </>
      )}
    </Button>
  );
}

export function StoryGenerator() {
  const [state, formAction] = useActionState(handleGenerateStory, initialState);
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(
    PlaceHolderImages[0]?.imageUrl || null
  );
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null); // 🔥 Added ref for Provenance Card

  const textOnlySchema = StoryGeneratorSchema.omit({ productPhoto: true });

  const form = useForm<any>({
    resolver: zodResolver(textOnlySchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      artisanNotes: '',
      productPhoto: undefined,
    },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(PlaceHolderImages[0]?.imageUrl || null);
      setImageBase64(undefined);
      form.setValue('productPhoto', undefined);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      form.setValue('productPhoto', base64);
    };
    reader.readAsDataURL(file);
  };

  // 🔥 Save Story Function
  const handleSaveStory = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        toast({
          title: 'Login Required',
          description: 'Please log in to save your story.',
        });
        return;
      }

      const user = JSON.parse(storedUser);
      const result = state.result;

      if (!result) {
        toast({
          title: 'No Story to Save',
          description: 'Generate a story first before saving.',
        });
        return;
      }

      const title = form.getValues('productName') || 'Untitled Story';
      const imageUrl = imagePreview || result.productImageUri || '';
      const short = result.productDescriptionShort || '';
      const long = result.productDescriptionLong || '';

      await saveGeneratedItem(user.uid || user.id, 'story', {
        title,
        imageUrl,
        short,
        long,
      });

      toast({
        title: 'Saved Successfully!',
        description: 'Your story has been saved to your library.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong while saving your story.',
        variant: 'destructive',
      });
    }
  };

  // 🔥 Download Provenance Card as Image
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = `${state.form.productName || 'provenance-card'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting card:', error);
      toast({
        title: 'Error',
        description: 'Could not download the card.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Left Panel - Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create a Product Story</CardTitle>
          <CardDescription>
            Fill in your product details. Our AI will craft a compelling story.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="productPhoto" value={imageBase64 ?? ''} />

            <CardContent className="space-y-4">
              {/* Image Upload */}
              <FormField
                control={form.control}
                name="productPhoto"
                render={() => (
                  <FormItem>
                    <FormLabel>Product Photo</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Product preview"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                              <Upload className="mb-2 h-8 w-8" />
                              <span>Upload an image</span>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="file:text-primary file:font-semibold"
                          onChange={onImageChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full"
                        placeholder="e.g., Terracotta Water Jug"
                        name="productName"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Description */}
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Details</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Materials, techniques, region of origin..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Artisan Notes */}
              <FormField
                control={form.control}
                name="artisanNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan's Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any personal story or inspiration behind this piece?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Right Panel - Results */}
      <div className="space-y-8">
        <AnimateOnResult result={state.result}>
          {state.result ? (
            <div className="space-y-8">
              {/* Generated Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">
                      Short Description
                    </h3>
                    <p className="font-body text-foreground/90">
                      {state.result.productDescriptionShort}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">
                      Detailed Description
                    </h3>
                    <p className="font-body text-foreground/90 whitespace-pre-wrap">
                      {state.result.productDescriptionLong}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">
                      Social Media Post
                    </h3>
                    <p className="font-body text-foreground/90 whitespace-pre-wrap">
                      {state.result.socialMediaPost}
                    </p>
                  </div>
                </CardContent>

                {/* Save Story Button */}
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSaveStory}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Story
                  </Button>
                </CardFooter>
              </Card>

              {/* Provenance Card + Download */}
              <div className="flex flex-col items-center">
                <h2 className="font-headline text-2xl mb-4 text-center">
                  Digital Provenance Card
                </h2>
                <ProvenanceCard
                  ref={cardRef}
                  productName={state.form.productName}
                  story={state.result.provenanceCardContent}
                  imageUrl={state.result.productImageUri}
                />
                <Button
                  onClick={handleDownloadCard}
                  className="mt-4 bg-primary text-white hover:bg-primary/90"
                >
                  <Save className="mr-2 h-4 w-4" /> Download Card
                </Button>
              </div>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <Sparkles className="mx-auto h-12 w-12" />
                <h3 className="mt-4 font-headline text-xl">
                  Your AI-Generated Story
                </h3>
                <p className="mt-2 max-w-xs">
                  The generated product descriptions, social media posts, and
                  provenance card will appear here.
                </p>
              </div>
            </Card>
          )}
        </AnimateOnResult>
      </div>
    </div>
  );
}

const AnimateOnResult: FC<{ result: any; children: React.ReactNode }> = ({
  result,
  children,
}) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (result) setShow(true);
  }, [result]);

  return (
    <div
      className={`transition-opacity duration-1000 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};
