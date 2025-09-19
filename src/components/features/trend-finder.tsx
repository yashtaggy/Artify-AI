'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, TrendingUp, Tag } from 'lucide-react';
import type { TrendFinderState } from '@/app/actions';
import { handleSuggestTrends } from '@/app/actions';
import { TrendFinderSchema, type TrendFinderInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const initialState: TrendFinderState = {
  form: {
    productType: '',
    artisanRegion: '',
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <TrendingUp className="mr-2" />
          Find Trends
        </>
      )}
    </Button>
  );
}

export function TrendFinder() {
  const [state, formAction] = useActionState(handleSuggestTrends, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<TrendFinderInput>({
    resolver: zodResolver(TrendFinderSchema),
    defaultValues: {
      productType: '',
      artisanRegion: '',
    },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error,
      });
    }
  }, [state.error, toast]);
  
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Discover Micro-Trends</CardTitle>
          <CardDescription>
            Find out what's popular for your craft in your region.
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
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pottery, Jewelry, Weaving" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artisanRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rajasthan, India or Tuscany, Italy" {...field} />
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Trend Analysis Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Market Insights</h3>
                  <p className="font-body text-foreground/90 whitespace-pre-wrap">{state.result.marketTrends}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Suggested Variations</h3>
                  <ul className="list-disc list-inside space-y-2 font-body text-foreground/90">
                    {state.result.suggestedVariations.map((variation, i) => <li key={i}>{variation}</li>)}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">SEO Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.result.seoKeywords.map((keyword, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        <Tag size={14} />
                        <span>{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12" />
              <h3 className="mt-4 font-headline text-xl">Your Trend Report</h3>
              <p className="mt-2 max-w-xs">Suggested product variations and SEO keywords will appear here after analysis.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
