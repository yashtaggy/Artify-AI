"use client";

import React, { useState } from "react";
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

  const chartData = React.useMemo(() => {
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
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="border border-border/50 bg-card shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-semibold text-foreground">
            <BarChart3 className="text-indigo-500" size={22} />
            Market Demand Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Enter your product name to analyze its global demand and get key insights.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="e.g., Handmade Candles"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={loading} className="w-full md:w-auto">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Analyze Market"}
            </Button>
          </div>

          {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="border border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe2 className="text-blue-500" size={20} />
                Global Trend for {result.productName}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Factory className="text-green-500" size={18} />
                  Top Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {result.data.competitors?.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe2 className="text-yellow-500" size={18} />
                  Top Demand Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {result.data.regions?.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lightbulb className="text-orange-500" size={20} />
                Market Insights & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic mb-3 border-l-4 border-indigo-500 pl-3">
                {result.data.insights}
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {result.data.tips?.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
