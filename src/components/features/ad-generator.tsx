'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Loader2, Megaphone, Upload, Bot } from 'lucide-react';
import type { AdGeneratorState } from '@/app/actions';
import { handleGenerateAds } from '@/app/actions';
import { AdGeneratorSchema, type AdGeneratorInput } from '@/lib/schemas';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialState: AdGeneratorState = {
  form: {
    productStory: '',
    artisanPreferences: '',
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          Generating Ads...
        </>
      ) : (
        <>
          <Megaphone className="mr-2" />
          Generate Ad Creatives
        </>
      )}
    </Button>
  );
}

export function AdGenerator() {
  const [state, formAction] = useActionState(handleGenerateAds, initialState);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(PlaceHolderImages[0]?.imageUrl || null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<AdGeneratorInput>({
    resolver: zodResolver(AdGeneratorSchema),
    defaultValues: {
      productStory: '',
      artisanPreferences: '',
      productImage: '', // Change undefined to an empty string to match the schema
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        form.setValue('productImage', base64);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(PlaceHolderImages[0]?.imageUrl || null);
      form.setValue('productImage', ''); // Set to empty string
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Ad Creatives</CardTitle>
          <CardDescription>
            Generate ready-to-use ads for your product.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form ref={formRef} action={formAction} className="space-y-4">
            <CardContent className="space-y-4">
              <input type="hidden" name="productImage" value={form.getValues('productImage') || ''} />
              
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Product preview" fill className="object-contain" />
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
                {form.formState.errors.productImage && (
                  <FormMessage>{form.formState.errors.productImage.message}</FormMessage>
                )}
              </FormItem>

              <FormField
                control={form.control}
                name="productStory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Story</FormLabel>
                    <Textarea placeholder="Paste the product story generated earlier." {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artisanPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience & Budget</FormLabel>
                    <Textarea placeholder="e.g., Eco-conscious buyers in Europe, with a small budget for a week-long campaign." {...field} />
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
      
      {/* ... rest of the component ... */}
    </div>
  );
}