"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Edit2, Home, Compass } from "lucide-react";
import Link from "next/link";
import AppTour from "@/components/onboarding/AppTour"; // ✅ import tour component

const logo = "/logo.png";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [startTour, setStartTour] = useState(false); // ✅ control manual tour start

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser");
      if (stored) setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const handleProfile = () => router.push("/profile/setup");
  const handleSettings = () => router.push("/settings");
  const handleDashboard = () => router.push("/dashboard");

  const handleStartTour = () => {
    // ✅ Reset tour flag and trigger it manually
    localStorage.setItem("artifyaiTourSeen", "false");
    setStartTour(true);
  };

  const handleStartTour = () => {
    // ✅ Reset tour flag and trigger it manually
    localStorage.setItem("artifyaiTourSeen", "false");
    setStartTour(true);
  };

  return (
    <header className="relative flex items-center justify-between border-b bg-card px-4 sm:px-6 py-3 sm:py-4 shadow-sm h-16 sm:h-20">
  {/* Left (Mobile): Logo & Name inline */}
  <div
    onClick={handleDashboard}
    className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 transition-opacity"
    title="Go to Dashboard"
    role="button"
  >
    <Image
      src={logo}
      alt="ArtifyAI Logo"
      width={40}
      height={40}
      className="rounded-md sm:w-16 sm:h-16"
    />
    <h1 className="font-headline text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
      ArtifyAI
    </h1>
  </div>

  {/* Right: Profile Dropdown */}
  <div className="flex items-center justify-end ml-auto">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 pr-8 sm:pr-10 pl-3 sm:pl-4 py-1.5 sm:py-2 text-sm sm:text-base"
          >
            <span className="text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-none">
              {user?.name || "Profile"}
            </span>
          </Button>

          {/* Floating Avatar */}
          <div className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background object-cover shadow-md"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-md">
                <User size={18} />
              </div>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 sm:w-52 mt-1 sm:mt-2">
        <DropdownMenuItem onClick={handleDashboard} className="flex items-center gap-2">
          <Home size={16} /> Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleProfile} className="flex items-center gap-2">
          <Edit2 size={16} /> Update Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2">
          <Settings size={16} /> Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleStartTour}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
        >
          <Compass size={16} /> Take ArtifyAI Tour
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-destructive"
        >
          <LogOut size={16} /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* ✅ AppTour trigger */}
  {startTour && <AppTour manualStart />}
</header>

  );
}
