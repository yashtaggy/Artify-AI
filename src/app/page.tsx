"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ArtifyLogo from "@/components/ArtifyLogo";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "🎭 Story Generator",
      description:
        "Every artisan has a story worth telling. Our AI crafts compelling narratives about your journey, inspirations, and techniques — ready to share on marketplaces and social media, building emotional connection with your buyers.",
    },
    {
      title: "📈 Trend Finder",
      description:
        "Know what’s trending in the world of crafts. Our AI analyzes global data to highlight emerging materials, colors, and styles that are in demand — so you can create what the world wants next.",
    },
    {
      title: "⭐ Craft Score",
      description:
        "Get a professional evaluation of your product’s appeal, uniqueness and sustainability score. The Craft Score helps you understand how your product stands against market expectations and where it can shine more.",
    },
    {
      title: "🧭 Market Demand Analyzer",
      description:
        "AI analyzes e-commerce and regional data to tell you where your craft category is booming, helping you target the right audience and increase your global reach.",
    },
    {
      title: "🎨 Ad Creatives Generator",
      description:
        "Generate beautiful, ready-to-use marketing posts, taglines, and captions for Instagram, Facebook, and online marketplaces — in your own tone and language.",
    },
    {
      title: "📚 Artify Library",
      description:
        "A storage of your saved stories ready to reuse again anytime",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 overflow-hidden">
      {/* Floating artistic shapes */}
      <motion.header
  className="absolute top-0 left-0 w-full flex items-center justify-center py-8 z-20"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
      <div className="flex flex-col items-center">
        <ArtifyLogo className="w-20 h-20" /> {/* Adjust size if needed */}
      <span className="text-2xl font-semibold text-amber-900 mt-2 tracking-wide">
      </span>
    </div>
    </motion.header>


      <motion.div
        className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-amber-400/30 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-orange-300/30 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-amber-900 tracking-tight drop-shadow-sm"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Empowering Artisans with <span className="text-amber-700">AI</span>
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-lg text-amber-800 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          ArtifyAI is your intelligent creative partner — helping local artisans
          tell their stories, understand trends, and reach global audiences
          through the power of artificial intelligence.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => router.push("/dashboard/")}
            className="bg-amber-700 hover:bg-amber-800 text-white text-lg px-8 py-6 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition-transform hover:scale-105"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-6 md:px-16 bg-white/60 backdrop-blur-md rounded-t-[3rem] shadow-inner">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-amber-900 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Discover What ArtifyAI Offers 🎨
        </motion.h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-amber-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-amber-800 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-24 px-6 text-center bg-gradient-to-tr from-amber-200 to-orange-100">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-amber-900 mb-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Mission 🌍
        </motion.h2>
        <motion.p
          className="max-w-3xl mx-auto text-lg text-amber-800 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          We are truly committed to empowering local artisans with the power of AI.
          By helping them narrate their stories, understand global trends, and market
          their crafts smartly, we bridge the gap between creativity and opportunity.
          ArtifyAI is more than a platform — it’s a movement to make traditional
          artistry thrive in the digital age.
        </motion.p>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-sm text-amber-800 bg-white/80 backdrop-blur-md border-t border-amber-200">
        <p>
          © {new Date().getFullYear()} ArtifyAI. Crafted for artisans by team ArtifyAI.
        </p>
      </footer>
    </div>
  );
}
