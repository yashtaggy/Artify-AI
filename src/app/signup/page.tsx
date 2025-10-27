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
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebaseAuth";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // ✅ Common function to send welcome email
  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      if (!email || !name) return;
      await fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch (err) {
      console.error("Welcome email failed:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate email
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., user@example.com).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: "Signup Failed",
          description: "Email already registered.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Create user in Firestore
      setLoading(true);
        try {
          const res = await signUpWithEmail(name, email, password);
        
          if (res.success && res.user) {
            localStorage.setItem("currentUser", JSON.stringify(res.user));
          
            // ✅ Send Welcome Email
            await sendWelcomeEmail(email, name);
          
            toast({
              title: "Account Created",
              description: "Welcome email sent! Please complete your profile setup.",
            });
          
            router.push("/profile/setup");
          } else {
            toast({
              title: "Signup Failed",
              description: "Email already registered or invalid password.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error(err);
          toast({
            title: "Signup Failed",
            description: "Something went wrong.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      // ✅ Send Welcome Email
      await sendWelcomeEmail(email, name);

      toast({
        title: "Account Created",
        description: "Welcome email sent! Please complete your profile setup.",
      });

      router.push("/profile/setup");
    } catch (err) {
      console.error(err);
      toast({
        title: "Signup Failed",
        description: "Something went wrong.",
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

        // ✅ Send Welcome Email for Google signup as well
        await sendWelcomeEmail(res.user.email, res.user.name);

        toast({
          title: "Account Created",
          description: `Welcome, ${res.user.name}! Please complete your profile setup.`,
        });

        router.push("/profile/setup");
      } else {
        toast({
          title: "Signup Failed",
          description: "Google sign-up failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Signup Failed",
        description: "Something went wrong.",
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
