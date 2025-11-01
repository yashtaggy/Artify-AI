"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryGenerator } from "@/components/features/story-generator";
import { TrendFinder } from "@/components/features/trend-finder";
import { AdGenerator } from "@/components/features/ad-generator";
import { Footer } from "@/components/footer";
import { MarketDemand } from "@/components/features/market-demand";
import { BarChart3 } from "lucide-react";
import { CraftScore } from "@/components/features/craft-score";
import {
  Sparkles,
  TrendingUp,
  Megaphone,
  BookOpen,
  X,
  PenTool,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import AppTour from "@/components/onboarding/AppTour";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!user?.uid && !user?.id) return;
  
    const userId = user.uid || user.id;
    const savedItemsRef = collection(db, "users", userId, "savedItems");
    const q = query(
      savedItemsRef,
      where("type", "==", "story"),
      orderBy("createdAt", "desc")
    );
  
    setLoadingStories(true);
  
    // 👇 Listen to Firestore in real time
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const stories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedStories(stories);
        setLoadingStories(false);
      },
      (error) => {
        console.error("Error listening for saved stories:", error);
        setLoadingStories(false);
      }
    );
  
    // Cleanup on unmount
    return () => unsubscribe();
  }, [user]);

  if (loading) return null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 px-2 sm:px-4 md:px-8 py-4">
        <Tabs defaultValue="story-generator" className="w-full">
        <TabsList className="flex w-full overflow-x-auto no-scrollbar gap-2 sm:gap-3 justify-start sm:justify-center px-2 py-2">
            <TabsTrigger value="story-generator" data-tour-id="story-generator" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" /> Story Generator
            </TabsTrigger>
            <TabsTrigger value="trend-finder" data-tour-id="trends-finder" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> Trend Finder
            </TabsTrigger>
            <TabsTrigger value="craft-score" data-tour-id="craft-score" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" /> Craft Score
            </TabsTrigger>
            <TabsTrigger value="market-demand" data-tour-id="market-demand" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" /> Market Demand
            </TabsTrigger>
            <TabsTrigger value="ad-generator" data-tour-id="ad-creatives" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <PenTool className="h-4 w-4 sm:h-5 sm:w-5" /> Ad-Creatives
            </TabsTrigger>
            <TabsTrigger value="my-library" data-tour-id="library" className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" /> My Library
            </TabsTrigger>
          </TabsList>

          {/* Story Generator */}
          <TabsContent value="story-generator" className="space-y-4">
            <StoryGenerator />
          </TabsContent>

          {/* Trend Finder */}
          <TabsContent value="trend-finder" className="space-y-4">
            <TrendFinder />
          </TabsContent>

          {/* Craft Score */}
          <TabsContent value="craft-score" className="space-y-4">
            <CraftScore />
          </TabsContent>

          {/* Market Demand */}
          <TabsContent value="market-demand" className="space-y-4">
            <MarketDemand />
          </TabsContent>

          {/* Ad-Creatives */}
          <TabsContent value="ad-generator" className="space-y-4">
            <AdGenerator />
          </TabsContent>

          {/* My Library */}
          <TabsContent value="my-library" className="space-y-4">
            {loadingStories ? (
              <p className="text-center text-muted-foreground">
                Loading your saved stories...
              </p>
            ) : savedStories.length === 0 ? (
              <p className="text-center text-muted-foreground">
                You haven’t saved any stories yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {savedStories.map((story) => (
                  <Card
                    key={story.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedStory(story)}
                  >
                    <CardHeader>
                      <CardTitle>
                        {story.content?.title ||
                          story.meta?.title ||
                          "Untitled Story"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {story.content?.imageUrl && (
                        <img
                          src={story.content.imageUrl}
                          alt={story.content?.title || "Story Image"}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      {story.content?.short && (
                        <p className="text-sm text-foreground/90 line-clamp-3">
                          {story.content.short}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Story Modal */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="w-[90vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStory?.content?.title ||
                selectedStory?.meta?.title ||
                "Untitled Story"}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X />
            </DialogClose>
            <DialogDescription>
              {selectedStory?.content?.short ||
                selectedStory?.meta?.short ||
                ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedStory?.content?.imageUrl && (
              <img
                src={selectedStory.content.imageUrl}
                alt={selectedStory.content?.title || "Story Image"}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            {selectedStory?.content?.long && (
              <p className="text-foreground/90 whitespace-pre-wrap">
                {selectedStory.content.long}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AppTour />
      <Footer />
    </div>
  );
}