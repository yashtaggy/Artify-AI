"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ArtifyLogo from "@/components/ArtifyLogo";
import WaveBackground from "@/components/WaveBackground";
import { signInWithGoogle } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const currentUser = JSON.parse(stored);
      if (currentUser.completedProfile) {
        router.push("/");
      } else {
        router.push("/profile/setup");
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      let userFound: any = null;
      querySnapshot.forEach((doc) => {
        if (doc.data().password === password) {
          userFound = { id: doc.id, ...doc.data() };
        }
      });

      if (!userFound) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      // Save full Firestore user document in localStorage
      localStorage.setItem("currentUser", JSON.stringify(userFound));

      router.push(userFound.completedProfile ? "/" : "/profile/setup");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userFound.name}!`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Login Failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user));

        router.push(res.user.completedProfile ? "/" : "/profile/setup");

        toast({
          title: "Login Successful",
          description: `Welcome, ${res.user.name}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Google sign-in failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Login Failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <WaveBackground />
      <div className="space-y-10 w-full max-w-md p-6 relative z-10">
        <ArtifyLogo />

        <form
          onSubmit={handleLogin}
          className="bg-card p-8 rounded-2xl shadow-xl w-full space-y-6 border border-border backdrop-blur-xl bg-opacity-80 transition-transform hover:scale-[1.02] duration-500"
        >
          <h2 className="text-2xl font-semibold text-foreground text-center tracking-wide">
            Welcome Back 👋
          </h2>

          <div className="space-y-4">
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
            disabled={authLoading}
          >
            {authLoading ? "Logging in..." : "Login"}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full font-semibold tracking-wide bg-red-500 hover:bg-red-600 text-white"
            disabled={authLoading}
          >
            {authLoading ? "Please wait..." : "Sign in with Google"}
          </Button>

          <p className="text-sm text-center text-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
