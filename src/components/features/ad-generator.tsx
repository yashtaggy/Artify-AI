'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Megaphone, Upload, Bot } from 'lucide-react';
import type { AdGeneratorState } from '@/app/actions';
import { handleGenerateAds } from '@/app/actions';
import { AdGeneratorSchema, type AdGeneratorInput } from '@/lib/schemas';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  const [state, formAction] = useFormState(handleGenerateAds, initialState);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(PlaceHolderImages[0]?.imageUrl || null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<AdGeneratorInput>({
    resolver: zodResolver(AdGeneratorSchema),
    defaultValues: {
      productStory: '',
      artisanPreferences: '',
      productImage: undefined,
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setImagePreview(PlaceHolderImages[0]?.imageUrl || null);
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
          <form
            ref={formRef}
            action={formAction}
            className="space-y-4"
          >
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="productImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
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
                                onChange={(e) => {
                                    field.onChange(e.target.files);
                                    onImageChange(e);
                                }}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productStory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Story</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste the product story generated earlier." {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea placeholder="e.g., Eco-conscious buyers in Europe, with a small budget for a week-long campaign." {...field} />
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
      
      <div>
        {state.result ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">AI-Generated Campaign</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="creatives" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="creatives">Ad Creatives</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    </TabsList>
                    <TabsContent value="creatives" className="mt-4 space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-primary">YouTube Short Idea</h3>
                            <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.youtubeShort}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-primary">Instagram Reel Idea</h3>
                            <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.instagramReel}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-primary">Google Ad Banner Copy</h3>
                            <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.googleAdBanner}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="strategy" className="mt-4 space-y-6">
                         <div>
                            <h3 className="font-semibold text-lg mb-2 text-primary">Audience Targeting</h3>
                            <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.audienceTargeting}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-primary">Budget Optimization</h3>
                            <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.budgetOptimization}</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <Bot className="mx-auto h-12 w-12" />
              <h3 className="mt-4 font-headline text-xl">Your Ad Campaign</h3>
              <p className="mt-2 max-w-xs">Generated ad creatives and strategy suggestions will appear here.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
