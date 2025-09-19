import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryGenerator } from "@/components/features/story-generator";
import { TrendFinder } from "@/components/features/trend-finder";
import { AdGenerator } from "@/components/features/ad-generator";
import { Sparkles, TrendingUp, Megaphone } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="story-generator" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-3 mx-auto mb-6 max-w-2xl">
            <TabsTrigger value="story-generator">
              <Sparkles className="mr-2" /> Story Generator
            </TabsTrigger>
            <TabsTrigger value="trend-finder">
              <TrendingUp className="mr-2" /> Trend Finder
            </TabsTrigger>
            <TabsTrigger value="ad-generator">
              <Megaphone className="mr-2" /> Ad Generator
            </TabsTrigger>
          </TabsList>
          <TabsContent value="story-generator" className="space-y-4">
            <StoryGenerator />
          </TabsContent>
          <TabsContent value="trend-finder" className="space-y-4">
            <TrendFinder />
          </TabsContent>
          <TabsContent value="ad-generator" className="space-y-4">
            <AdGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
