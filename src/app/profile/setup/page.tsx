"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const avatarOptions = [
  { name: "Painter", src: "/avatars/painter1.png" },
  { name: "Painter", src: "/avatars/painter2.png" },
  { name: "Painter", src: "/avatars/painter3.png" },
  { name: "Musician", src: "/avatars/musician1.png" },
  { name: "Musician", src: "/avatars/musician2.png" },
  { name: "Sculptor", src: "/avatars/sculptor1.png" },
  { name: "Sculptor", src: "/avatars/sculptor2.png" },
  { name: "Designer", src: "/avatars/designer1.png" },
  { name: "Designer", src: "/avatars/designer2.png" },
  { name: "Photographer", src: "/avatars/photographer1.png" },
  { name: "Photographer", src: "/avatars/photographer2.png" },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [portfolioURL, setPortfolioURL] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("/avatars/painter1.png");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [studioLocation, setStudioLocation] = useState("");
  const [yearsOfPractice, setYearsOfPractice] = useState("");
  const [achievements, setAchievements] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    const currentUser = JSON.parse(stored);
    setUser(currentUser);

    setBio(currentUser.bio || "");
    setCategory(currentUser.category || "");
    setPortfolioURL(currentUser.portfolioURL || "");
    setStudioLocation(currentUser.studioLocation || "");
    setYearsOfPractice(currentUser.yearsOfPractice || "");
    setAchievements(currentUser.achievements || "");
    setSocialLinks(currentUser.socialLinks || "");
    setSelectedAvatar(currentUser.photoURL || "/avatars/painter1.png");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return;

    try {
      setLoading(true);
      const docRef = doc(db, "users", user.id);

      await updateDoc(docRef, {
        bio,
        category,
        portfolioURL,
        studioLocation,
        yearsOfPractice,
        achievements,
        socialLinks,
        photoURL: selectedAvatar,
        completedProfile: true,
        updatedAt: new Date(),
      });

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...user,
          bio,
          category,
          portfolioURL,
          studioLocation,
          yearsOfPractice,
          achievements,
          socialLinks,
          photoURL: selectedAvatar,
          completedProfile: true,
        })
      );

      toast({
        title: "Profile Saved 🎨",
        description: "Your artist profile has been updated successfully!",
      });

      router.push("/");
    } catch (err: any) {
      console.error("Profile setup error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2d1e0f] to-[#3b2d1d] text-white flex flex-col items-center p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Complete Your Artist Profile 🪶
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-card/80 backdrop-blur-xl rounded-2xl p-10 space-y-6 shadow-xl border border-border"
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <motion.img
            src={selectedAvatar}
            alt="Selected Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-lg mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <Button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="bg-primary/80 hover:bg-primary text-white font-medium"
          >
            Choose Avatar
          </Button>
        </div>

        {/* Avatar Modal */}
        <AnimatePresence>
          {showAvatarModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white text-black rounded-2xl p-6 max-w-3xl w-full shadow-2xl overflow-y-auto"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-center mb-4">
                  Select Your Artist Avatar
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
                  {avatarOptions.map((avatar) => (
                    <motion.img
                      key={avatar.src}
                      src={avatar.src}
                      alt={avatar.name}
                      className={`w-20 h-20 rounded-full cursor-pointer border-4 transition-transform hover:scale-110 ${
                        selectedAvatar === avatar.src
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      whileHover={{ rotate: 2 }}
                      onClick={() => {
                        setSelectedAvatar(avatar.src);
                        setShowAvatarModal(false);
                      }}
                    />
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowAvatarModal(false)}
                    className="bg-gray-800 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Short Bio</Label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your art..."
              required
            />
          </div>

          <div>
            <Label>Product Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-background border-input rounded-md p-2 text-foreground"
            >
              <option value="">Select one</option>
              <option value="Painter">Painter</option>
              <option value="Musician">Musician</option>
              <option value="Sculptor">Sculptor</option>
              <option value="Photographer">Photographer</option>
              <option value="Designer">Designer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label>Studio Location (Optional)</Label>
            <Input
              value={studioLocation}
              onChange={(e) => setStudioLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label>Years of Practice</Label>
            <Input
              type="number"
              value={yearsOfPractice}
              onChange={(e) => setYearsOfPractice(e.target.value)}
              placeholder="e.g., 5"
              min={0}
              required
            />
          </div>

          <div>
            <Label>Portfolio Link (Optional)</Label>
            <Input
              type="url"
              value={portfolioURL}
              onChange={(e) => setPortfolioURL(e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div>
            <Label>Key Achievements / Awards (Optional)</Label>
            <Input
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="List your key achievements"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Social Media Links (Optional)</Label>
            <Input
              value={socialLinks}
              onChange={(e) => setSocialLinks(e.target.value)}
              placeholder="Comma-separated links, e.g., Instagram, Twitter, LinkedIn"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full font-semibold tracking-wide bg-primary text-white hover:bg-primary/90 mt-4"
        >
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
