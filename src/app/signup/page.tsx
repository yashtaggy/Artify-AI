"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import ArtifyLogo from "@/components/ArtifyLogo";
import WaveBackground from "@/components/WaveBackground";
import { signInWithGoogle } from "@/lib/firebaseAuth";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: "Signup Failed",
          description: "Email already registered",
          variant: "destructive",
        });
        return;
      }

      // Create user with default profile fields
      const newUserData = {
        name,
        email,
        password,
        bio: "",
        category: "",
        portfolioURL: "",
        studioLocation: "",
        yearsOfPractice: "",
        achievements: "",
        socialLinks: "",
        photoURL: "",
        completedProfile: false,
        createdAt: new Date(),
      };

      const docRef = await addDoc(usersRef, newUserData);

      // Save full user in localStorage
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...newUserData, id: docRef.id })
      );

      toast({
        title: "Account Created",
        description: "Please complete your profile setup.",
      });

      router.push("/profile/setup");
    } catch (err) {
      console.error(err);
      toast({
        title: "Signup Failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user));

        toast({
          title: "Account Created",
          description: `Welcome, ${res.user.name}! Please complete your profile setup.`,
        });

        router.push("/profile/setup");
      } else {
        toast({
          title: "Signup Failed",
          description: "Google sign-up failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Signup Failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <WaveBackground />
      <div className="space-y-10 w-full max-w-md p-6 relative z-10">
        <ArtifyLogo />
        <form
          onSubmit={handleSignup}
          className="bg-card p-8 rounded-2xl shadow-xl w-full space-y-6 border border-border backdrop-blur-xl bg-opacity-80 transition-transform hover:scale-[1.02] duration-500"
        >
          <h2 className="text-2xl font-semibold text-foreground text-center tracking-wide">
            Create Your Account ✨
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full font-semibold tracking-wide bg-red-500 hover:bg-red-600 text-white"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Sign up with Google"}
          </Button>

          <p className="text-sm text-center text-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
