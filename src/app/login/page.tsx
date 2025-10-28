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
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
      // ✅ Authenticate using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      // ✅ Fetch corresponding Firestore document (profile data)
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      let userData: any = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      const finalUser = {
        id: uid,
        name: user.displayName || userData.name || "",
        email: user.email,
        photoURL: user.photoURL || userData.photoURL || "",
        ...userData,
        completedProfile: userData.completedProfile ?? false,
      };

      // ✅ Save locally
      localStorage.setItem("currentUser", JSON.stringify(finalUser));

      router.push(finalUser.completedProfile ? "/" : "/profile/setup");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${finalUser.name || "User"}!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Something went wrong.";
      if (error.code === "auth/user-not-found") message = "No account found with this email.";
      if (error.code === "auth/wrong-password") message = "Incorrect password.";
      if (error.code === "auth/invalid-email") message = "Invalid email format.";

      toast({
        title: "Login Failed",
        description: message,
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
