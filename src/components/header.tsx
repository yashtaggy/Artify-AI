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
import { User, LogOut, Settings, Edit2, Home } from "lucide-react";
import Link from "next/link";

const logo = "/logo.png";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
  const handleDashboard = () => router.push("/");

  return (
    <header className="relative flex items-center justify-between border-b bg-card px-6 py-4 shadow-sm h-20">
      {/* Center Group: Clickable Logo + Name */}
      <div
        onClick={handleDashboard}
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        title="Go to Dashboard"
        role="button"
      >
        <Image
          src={logo}
          alt="ArtifyAI Logo"
          width={80}
          height={80}
          className="rounded-md"
        />
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
          ArtifyAI
        </h1>
      </div>

      {/* Right: Profile Dropdown */}
      <div className="flex items-center justify-end ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              {/* Name Button */}
              <Button
                variant="outline"
                className="flex items-center gap-2 pr-10 pl-4 py-2"
              >
                <span className="text-sm font-medium">
                  {user?.name || "Profile"}
                </span>
              </Button>

              {/* Floating Avatar */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-background object-cover shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-md">
                    <User size={20} />
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44 mt-2">
            <DropdownMenuItem
              onClick={handleDashboard}
              className="flex items-center gap-2"
            >
              <Home size={16} /> Dashboard
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleProfile}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} /> Update Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleSettings}
              className="flex items-center gap-2"
            >
              <Settings size={16} /> Settings
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
    </header>
  );
}
