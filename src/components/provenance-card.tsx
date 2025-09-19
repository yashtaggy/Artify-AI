import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

type ProvenanceCardProps = {
  productName: string;
  story: string;
  imageUrl: string;
};

export function ProvenanceCard({
  productName,
  story,
  imageUrl,
}: ProvenanceCardProps) {
  return (
    <Card className="w-full max-w-md overflow-hidden bg-card shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="relative h-56 w-full">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover"
            data-ai-hint="product photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-6">
            <CardTitle className="font-headline text-3xl text-primary-foreground">
              {productName}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            The Story
          </h3>
          <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-foreground">
            {story}
          </p>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">CraftGenie</span>
          </div>
          <p className="text-xs">Authenticity Verified</p>
        </div>
      </CardContent>
    </Card>
  );
}
