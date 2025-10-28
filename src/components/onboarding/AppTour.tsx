"use client";

import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, Styles } from "react-joyride";

interface AppTourProps {
  /** When true, starts tour manually (from Settings) */
  manualStart?: boolean;
}

export default function AppTour({ manualStart = false }: AppTourProps) {
  const [run, setRun] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [steps] = useState<Step[]>([
    {
      target: '[data-tour-id="story-generator"]',
      content:
        "✨ Welcome to the Story Generator — your creative playground! Here you can write prompts or ideas, and ArtifyAI will instantly craft compelling stories, ad scripts, or captions tailored to your needs. Use this space to unleash your creativity and experiment freely.",
    },
    {
      target: '[data-tour-id="trends-finder"]',
      content:
        "📈 The Trends Finder helps you stay ahead of the curve by analyzing what’s popular right now. Discover trending topics, hashtags, and creative patterns to inspire your next piece of content or marketing campaign.",
    },
    {
      target: '[data-tour-id="craft-score"]',
      content:
        "⭐ The Craft Score is your story’s performance analyzer. It evaluates your generated content for engagement, tone, and structure — helping you improve your storytelling quality and understand how your audience might react.",
    },
    {
      target: '[data-tour-id="ad-creatives"]',
      content:
        "🎨 The Ad Creatives tool transforms your story or idea into professional-quality ad visuals and copy. You can generate image concepts, catchy taglines, and ready-to-use promotional content with just a few clicks.",
    },
    {
      target: '[data-tour-id="library"]',
      content:
        "📚 Welcome to your Library — your personal archive of everything you’ve created. All your generated stories, ads, and ideas are automatically saved here so you can revisit, edit, or reuse them anytime.",
    },
  ]);

  useEffect(() => {
    const tourSeen = localStorage.getItem("artifyaiTourSeen");

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, { attributes: true });
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );

    if (manualStart) {
      setRun(true);
      return;
    }

    if (!tourSeen) {
      setRun(true);
    }

    return () => observer.disconnect();
  }, [manualStart]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) && !manualStart) {
      localStorage.setItem("artifyaiTourSeen", "true");
      setRun(false);
    }
  };

  const dynamicStyles: Styles = {
    options: {
      zIndex: 10000,
      primaryColor: "hsl(var(--primary))",
      backgroundColor:
        theme === "dark"
          ? "hsl(var(--card))"
          : "hsl(var(--background))",
      textColor: "hsl(var(--foreground))",
    },
    tooltipContainer: {
      borderRadius: "0.75rem",
      padding: "1rem",
    },
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling
      callback={handleJoyrideCallback}
      styles={dynamicStyles}
    />
  );
}
