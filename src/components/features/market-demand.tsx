"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, Lightbulb, Globe2, Factory } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const MarketDemand = () => {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!productName.trim()) {
      setError("Please enter a product name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/market-demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze demand.");
        return;
      }
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!result?.data) return [];
    const hist = result.data.historical_data || {};
    const forecast = result.data.forecast_data || {};
    return [
      ...Object.entries(hist).map(([year, val]) => ({
        year,
        demand: Number(val),
        type: "Historical",
      })),
      ...Object.entries(forecast).map(([year, val]) => ({
        year,
        demand: Number(val),
        type: "Forecast",
      })),
    ];
  }, [result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto p-4 space-y-6"
    >
      {/* Input Card */}
      <Card className="border border-border/40 bg-card/70 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <BarChart3 className="text-primary" size={22} />
            Market Demand Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Enter your product name to analyze its global demand and get actionable insights.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="e.g., Handmade Candles"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full md:w-auto transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Analyze Market"}
            </Button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm mt-1"
            >
              {error}
            </motion.p>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Chart */}
          <Card className="border border-border/40 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe2 className="text-blue-500" size={20} />
                Global Trend for {result.productName}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Year", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    label={{
                      value: "Demand Index",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="url(#lineGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: "hsl(var(--card))", strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Competitors & Regions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.01 }}>
              <Card className="border border-border/40 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Factory className="text-green-500" size={18} />
                    Top Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.data.competitors?.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <Card className="border border-border/40 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Globe2 className="text-yellow-500" size={18} />
                    Top Demand Regions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.data.regions?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Insights */}
          <motion.div whileHover={{ scale: 1.005 }}>
            <Card className="border border-border/40 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lightbulb className="text-orange-500" size={20} />
                  Market Insights & Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic mb-3 border-l-4 border-primary pl-3">
                  {result.data.insights}
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.data.tips?.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
