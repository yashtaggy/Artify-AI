'use client';

import { useActionState, useEffect, useRef, useState, type FC } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Loader2, Sparkles, Upload, Save, Copy, Share2 } from 'lucide-react'; // 🔥 Added Share2 icon
import * as htmlToImage from 'html-to-image';
import type { StoryGenerationState } from '@/app/actions';
import { handleGenerateStory } from '@/app/actions';
import { StoryGeneratorSchema } from '@/lib/schemas';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { uploadImage } from "@/lib/uploadImage";
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

// Helper Component for Copy Button
interface CopyButtonProps {
  textToCopy: string;
  label: string;
  toast: ReturnType<typeof useToast>['toast'];
}

const CopyButton: FC<CopyButtonProps> = ({ textToCopy, label, toast }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="self-end p-2 h-auto text-muted-foreground hover:text-primary">
      <Copy className="h-4 w-4 mr-1" />
      Copy
    </Button>
  );
};


export function StoryGenerator() {
  const [state, formAction] = useActionState(handleGenerateStory, initialState);
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(
    PlaceHolderImages[0]?.imageUrl || null
  );
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) {
        toast({
          title: "Login Required",
          description: "Please log in to save your story.",
        });
        return;
      }
  
      const user = JSON.parse(storedUser);
      const result = state.result;
  
      if (!result) {
        toast({
          title: "No Story to Save",
          description: "Generate a story first before saving.",
        });
        return;
      }
  
      // ✅ Extract main story text safely
      const storyText =
        typeof result === "string"
          ? result
          : result?.story ||
            result?.long ||
            result?.productDescriptionLong ||
            result?.description ||
            JSON.stringify(result, null, 2);
  
      // ✅ Title (fallback if missing)
      const title =
        form.getValues("productName") ||
        result?.title ||
        "Untitled Story";
  
      // ✅ Choose image URL only if it's an actual link (not base64 or blob)
      let imageUrl = "";
      if (result?.productImageUri?.startsWith("http")) {
        imageUrl = result.productImageUri;
      } else if (result?.imageUrl?.startsWith("http")) {
        imageUrl = result.imageUrl;
      } else if (imagePreview?.startsWith("http")) {
        imageUrl = imagePreview;
      } else {
        // fallback placeholder (to avoid base64/blob)
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`;
      }
  
      console.log("🧩 Story being saved:", { title, imageUrl, storyText });
  
      // ✅ Save to Firestore
      await saveGeneratedItem(user.uid || user.id, "story", {
        title,
        imageUrl,
        long: storyText,
      });
  
      toast({
        title: "Saved Successfully!",
        description: "Your story has been saved to your library.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while saving your story.",
        variant: "destructive",
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
      toast({
        title: 'Download Successful',
        description: 'Provenance card downloaded as PNG.',
      });
    } catch (error) {
      console.error('Error exporting card:', error);
      toast({
        title: 'Error',
        description: 'Could not download the card.',
        variant: 'destructive',
      });
    }
  };
  
  // 🔥 Share Provenance Card
  const handleShareCard = async () => {
    if (!cardRef.current) return;
    
    // Check for Web Share API support
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current);
        
        // Convert Data URL to Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        // Create a File object
        const fileName = `${state.form.productName || 'provenance-card'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        const shareData = {
          files: [file],
          title: `Provenance Card for ${state.form.productName || 'Product'}`,
          text: `Check out the story and provenance of this item: ${state.form.productName}`,
        };

        await navigator.share(shareData);
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled the share
          return;
        }
        console.error('Error sharing card:', error);
        toast({
          title: 'Share Failed',
          description: 'Could not share the card. Try downloading it instead.',
          variant: 'destructive',
        });
      }
    } else {
      // Fallback for browsers without Web Share API
      const mailtoLink = `mailto:?subject=${encodeURIComponent(`Provenance Card for ${state.form.productName || 'Product'}`)}&body=${encodeURIComponent(`I wanted to share the digital provenance card for this item: ${state.form.productName}.\n\nYou can download the image and share it via WhatsApp or Instagram manually.`)}`;

      window.location.href = mailtoLink;
      
      toast({
        title: 'Share Fallback',
        description: 'Opening email client. Please download the image for sharing on platforms like WhatsApp or Drive.',
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
                      <Textarea
                        {...field}
                        placeholder="e.g., Terracotta Water Jug"
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
                  {/* Short Description */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-primary">
                        Short Description
                      </h3>
                      <CopyButton 
                        textToCopy={state.result.productDescriptionShort} 
                        label="Short Description" 
                        toast={toast} 
                      />
                    </div>
                    <p className="font-body text-foreground/90">
                      {state.result.productDescriptionShort}
                    </p>
                  </div>
                  <Separator />
                  {/* Detailed Description */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-primary">
                        Detailed Description
                      </h3>
                      <CopyButton 
                        textToCopy={state.result.productDescriptionLong} 
                        label="Detailed Description" 
                        toast={toast} 
                      />
                    </div>
                    <p className="font-body text-foreground/90 whitespace-pre-wrap">
                      {state.result.productDescriptionLong}
                    </p>
                  </div>
                  <Separator />
                  {/* Social Media Post */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-primary">
                        Social Media Post
                      </h3>
                      <CopyButton 
                        textToCopy={state.result.socialMediaPost} 
                        label="Social Media Post" 
                        toast={toast} 
                      />
                    </div>
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

              {/* Provenance Card + Download/Share */}
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
                <div className="flex space-x-4 mt-4"> {/* 🔥 Added div for button group */}
                  <Button
                    onClick={handleDownloadCard}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" /> Download Card
                  </Button>
                  <Button
                    onClick={handleShareCard}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share Card
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed text-center px-6 py-10">
  <div className="max-w-md text-muted-foreground space-y-8">

    {/* Title */}
    <div>
      <h2 className="font-headline text-2xl mb-2">
        Story Output Preview
      </h2>
      <p className="opacity-70">
        Your generated content will appear in the sections below.
      </p>
    </div>

    <Separator />

    {/* Short Description */}
    <div>
      <h3 className="font-semibold text-lg mb-1">
        Short Description
      </h3>
      <p className="text-sm opacity-70 italic">
        A concise product summary will appear here.
      </p>
    </div>

    <Separator />

    {/* Detailed Description */}
    <div>
      <h3 className="font-semibold text-lg mb-1">
        Detailed Description
      </h3>
      <p className="text-sm opacity-70 italic">
        A long, story-driven description will appear here.
      </p>
    </div>

    <Separator />

    {/* Social Media Post */}
    <div>
      <h3 className="font-semibold text-lg mb-1">
        Social Media Post
      </h3>
      <p className="text-sm opacity-70 italic">
        A ready-to-share social caption will appear here.
      </p>
    </div>

    <Separator />

    {/* Provenance Card */}
    <div>
      <h3 className="font-semibold text-lg mb-1">
        Digital Provenance Card
      </h3>
      <p className="text-sm opacity-70 italic">
        A preview of your provenance card will appear here.
      </p>
    </div>

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

  // Before any result, just render children normally (no fade-out)
  if (!result) {
    return <>{children}</>;
  }

  // After result exists, apply fade-in
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
