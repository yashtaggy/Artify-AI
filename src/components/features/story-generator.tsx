'use client';

import { useActionState, useEffect, useRef, useState, type FC } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import type { StoryGenerationState } from '@/app/actions';
import { handleGenerateStory } from '@/app/actions';
import { StoryGeneratorSchema } from '@/lib/schemas';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ProvenanceCard } from '../provenance-card';
import { Separator } from '../ui/separator';

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

  // image for preview (could be placeholder or data URI)
  const [imagePreview, setImagePreview] = useState<string | null>(PlaceHolderImages[0]?.imageUrl || null);

  // only the Base64 dataURI (actual value we want to send to server)
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);

  const formRef = useRef<HTMLFormElement>(null);

  // Client-side validation should ignore productPhoto (we validate it server-side).
  const textOnlySchema = StoryGeneratorSchema.omit({ productPhoto: true });

  // useForm typed as any to avoid type mismatch for omitted schema; safe to keep strict in your project later
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
      // also clear react-hook-form value if you want
      form.setValue('productPhoto', undefined);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      // keep react-hook-form state in sync (optional, but useful)
      form.setValue('productPhoto', base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create a Product Story</CardTitle>
          <CardDescription>Fill in your product details. Our AI will craft a compelling story.</CardDescription>
        </CardHeader>

        <Form {...form}>
          {/* IMPORTANT: we use a real HTML form so Next server action receives form fields */}
          <form ref={formRef} action={formAction} className="space-y-4">
            {/* Hidden input: ensures the Base64 string is submitted as 'productPhoto' */}
            <input type="hidden" name="productPhoto" value={imageBase64 ?? ''} />

            <CardContent className="space-y-4">
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
                            // Next Image can accept data URI
                            <Image src={imagePreview} alt="Product preview" fill className="object-contain" />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                              <Upload className="mb-2 h-8 w-8" />
                              <span>Upload an image</span>
                            </div>
                          )}
                        </div>

                        {/* real file input for user - we convert it to Base64 on change */}
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

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <input {...field} className="w-full" placeholder="e.g., Terracotta Water Jug" name="productName" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Details</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Materials, techniques, region of origin..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artisanNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan's Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any personal story or inspiration behind this piece?" />
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

      <div className="space-y-8">
        <AnimateOnResult result={state.result}>
          {state.result ? (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">Short Description</h3>
                    <p className="font-body text-foreground/90">{state.result.productDescriptionShort}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">Detailed Description</h3>
                    <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.productDescriptionLong}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">Social Media Post</h3>
                    <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.socialMediaPost}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center">
                <h2 className="font-headline text-2xl mb-4 text-center">Digital Provenance Card</h2>
                <ProvenanceCard
                  productName={state.form.productName}
                  story={state.result.provenanceCardContent}
                  imageUrl={state.result.productImageUri}
                />
              </div>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <Sparkles className="mx-auto h-12 w-12" />
                <h3 className="mt-4 font-headline text-xl">Your AI-Generated Story</h3>
                <p className="mt-2 max-w-xs">The generated product descriptions, social media posts, and provenance card will appear here.</p>
              </div>
            </Card>
          )}
        </AnimateOnResult>
      </div>
    </div>
  );
}

const AnimateOnResult: FC<{ result: any; children: React.ReactNode }> = ({ result, children }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (result) setShow(true);
  }, [result]);

  return <div className={`transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</div>;
};
