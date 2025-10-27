"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryGenerator } from "@/components/features/story-generator";
import { TrendFinder } from "@/components/features/trend-finder";
import { AdGenerator } from "@/components/features/ad-generator";
import { CraftScore } from "@/components/features/craft-score";
import {
  Sparkles,
  TrendingUp,
  Megaphone,
  BookOpen,
  X,
  Palette,
  PenTool,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

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

  const fetchSavedStories = async (userId: string) => {
    setLoadingStories(true);
    try {
      const savedItemsRef = collection(db, "users", userId, "savedItems");
      const q = query(
        savedItemsRef,
        where("type", "==", "story"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const stories: any[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedStories(stories);
    } catch (err) {
      console.error("Error fetching saved stories:", err);
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    if (user?.uid || user?.id) {
      fetchSavedStories(user.uid || user.id);
    }
  }, [user]);

  if (loading) return null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="story-generator" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-5 mx-auto mb-6 max-w-5xl">
            <TabsTrigger value="story-generator">
              <Sparkles className="mr-2" /> Story Generator
            </TabsTrigger>
            <TabsTrigger value="trend-finder">
              <TrendingUp className="mr-2" /> Trend Finder
            </TabsTrigger>
            <TabsTrigger value="craft-score">
              <Megaphone className="mr-2" /> Craft Score
            </TabsTrigger>
            <TabsTrigger value="ad-generator">
              <PenTool className="mr-2" /> Ad-Creatives
            </TabsTrigger>
            <TabsTrigger value="my-library">
              <BookOpen className="mr-2" /> My Library
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
        <DialogContent className="max-w-3xl w-full">
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
    </div>
  );
}
