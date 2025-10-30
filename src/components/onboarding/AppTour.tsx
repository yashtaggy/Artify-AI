"use client";

import React, { useEffect, useState } from "react";
import { TourProvider, useTour } from "@reactour/tour";

interface AppTourProps {
  /** When true, starts tour manually (from Settings) */
  manualStart?: boolean;
}

const TourContent = ({ manualStart }: AppTourProps) => {
  const { setIsOpen, currentStep, setCurrentStep, steps, isOpen } = useTour();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const tourSeen = localStorage.getItem("artifyaiTourSeen");

    // Observe theme mode changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true });
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );

    // Show the tour only if not seen before or manualStart is true
    if (manualStart) {
      setIsOpen(true);
      return;
    }

    if (!tourSeen) {
      setIsOpen(true);
    }

    return () => observer.disconnect();
  }, [manualStart, setIsOpen]);

  // ✅ When user closes or finishes the tour — mark it as seen
  useEffect(() => {
    if (!isOpen) {
      localStorage.setItem("artifyaiTourSeen", "true");
    }
  }, [isOpen]);

  // ✅ Also ensure flag is set when last step is reached
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      localStorage.setItem("artifyaiTourSeen", "true");
    }
  }, [currentStep, steps.length]);

  return null;
};

export default function AppTour({ manualStart = false }: AppTourProps) {
  const steps = [
    {
      selector: '[data-tour-id="story-generator"]',
      content:
        "✨ Welcome to the Story Generator — your creative playground! Write prompts or ideas and watch ArtifyAI instantly craft stories, ad scripts, or captions.",
    },
    {
      selector: '[data-tour-id="trends-finder"]',
      content:
        "📈 The Trends Finder helps you stay ahead of the curve by analyzing what’s popular right now. Discover trending topics and creative inspiration.",
    },
    {
      selector: '[data-tour-id="craft-score"]',
      content:
        "⭐ The Craft Score evaluates your content for engagement, tone, and structure — helping you understand and refine your storytelling quality.",
    },
    {
      selector: '[data-tour-id="ad-creatives"]',
      content:
        "🎨 The Ad Creatives tool transforms your ideas into ad copy in seconds. Perfect for quick campaign launches.",
    },
    {
      selector: '[data-tour-id="library"]',
      content:
        "📚 Your Library stores all your generated stories ready to reuse anytime.",
    },
  ];

  const theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  return (
    <TourProvider
      steps={steps}
      padding={10}
      scrollSmooth
      disableKeyboardNavigation={false}
      showNavigation
      showDots
      showBadge={false}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: "1rem",
          backgroundColor:
            theme === "dark"
              ? "hsl(var(--card) / 0.95)"
              : "hsl(var(--background) / 0.95)",
          color: "hsl(var(--foreground))",
          boxShadow:
            theme === "dark"
              ? "0 6px 18px rgba(0,0,0,0.5)"
              : "0 6px 18px rgba(0,0,0,0.15)",
          padding: "1.25rem 1.5rem",
          maxWidth: 400,
        }),
        maskArea: (base) => ({
          ...base,
          rx: 16,
          ry: 16,
        }),
        maskWrapper: (base) => ({
          ...base,
          color:
            theme === "dark"
              ? "rgba(0,0,0,0.55)"
              : "rgba(255,255,255,0.4)",
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--primary))",
          color: "white",
          borderRadius: "0.5rem",
        }),
        controls: (base) => ({
          ...base,
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }),
        close: (base) => ({
          ...base,
          color: "hsl(var(--muted-foreground))",
          fontWeight: 400,
        }),
      }}
    >
      <TourContent manualStart={manualStart} />
    </TourProvider>
  );
}
