"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper component for displaying key score metrics
const ScoreMetric = ({ title, value, unit, colorClass }: { title: string, value: string, unit: string, colorClass: string }) => (
  <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md transition hover:shadow-lg border border-gray-200 dark:border-gray-700">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
    <div className="flex items-baseline">
      <span className={`text-3xl font-extrabold ${colorClass}`}>{value}</span>
      <span className="text-lg font-semibold ml-1 text-gray-600 dark:text-gray-300">{unit}</span>
    </div>
  </div>
);

export function CraftScore() {
  const [form, setForm] = useState({
    productName: "Handmade Clay Mug",
    productDesc: "A small, wheel-thrown ceramic mug with a smooth glaze, fired in an electric kiln.",
    materials: ["Ceramic Clay", "Natural Dyes"],
    origin: "Local",
    materialCost: 500,
    hoursSpent: 5,
    demandLevel: "Medium",
    energyUsed: 20,
    productionHours: 5,
  });
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expanded list of materials for more artistic input
  const materialsList = [
    "Recycled Paper", "Organic Cotton", "Natural Dyes", "Reclaimed Wood", 
    "Recycled Glass", "Copper", "Ceramic Clay", "Epoxy Resin", 
    "Vegetable-tanned Leather", "Hemp Fiber", "Upcycled Textiles", "Aluminum", 
    "Plant-based Resin", "Beeswax", "Stone"
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
        ...form,
        materials: form.materials.length > 0 ? form.materials : [],
    };

    try {
      const res = await fetch("/api/craft-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "An unknown server error occurred.");
        setResult(null);
        return;
      }
      
      setResult(data);
      setError(null);

    } catch (e) {
      console.error(e);
      setError("Network or parsing error. Check your server status.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format numbers, preventing the 'toFixed' error
  const formatNumber = (value: number | undefined, decimals: number = 2, defaultValue: string = 'N/A') => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimals);
    }
    return defaultValue;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-2xl border-t-4 border-indigo-500">
        <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20 py-6">
          <CardTitle className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
            🎨 Craft Score Analyzer
          </CardTitle>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Optimize your pricing and environmental impact.</p>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          {/* Section 1: Product Identity and Image */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-700 dark:text-gray-200">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Label htmlFor="product-name-input">Product Name</Label>
                    <Input
                        id="product-name-input"
                        placeholder="e.g., Minimalist Leather Wallet"
                        value={form.productName}
                        onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    />
                    <Label htmlFor="product-desc-textarea">Product Description</Label>
                    <Textarea
                        id="product-desc-textarea"
                        placeholder="Detailed description including techniques and quality features."
                        value={form.productDesc}
                        rows={3}
                        onChange={(e) => setForm({ ...form, productDesc: e.target.value })}
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="image-upload">📷 Product Image (optional)</Label>
                    <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files?.[0] || null)} 
                    />
                    {image && (
                    <img
                        src={URL.createObjectURL(image)}
                        alt="Uploaded Product"
                        className="mt-2 rounded-lg w-full h-32 object-cover border border-gray-200"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x200/4c4a4e/ffffff?text=Image+Load+Error')}
                    />
                    )}
                </div>
            </div>
          </div>

          {/* Section 2: Crafting Metrics and Sustainability */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-700 dark:text-gray-200">Metrics & Materials</h3>
            
            {/* Material Selection */}
            <Label className="block mb-2 text-md font-medium">Materials Used (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                {materialsList.map((m) => (
                    <Button
                        key={m}
                        size="sm"
                        variant={form.materials.includes(m) ? "default" : "outline"}
                        onClick={() =>
                            setForm({
                                ...form,
                                materials: form.materials.includes(m)
                                    ? form.materials.filter((x) => x !== m)
                                    : [...form.materials, m],
                            })
                        }
                        className={form.materials.includes(m) ? "bg-green-600 hover:bg-green-700" : "hover:bg-gray-100"}
                    >
                        {m}
                    </Button>
                ))}
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                    <Label htmlFor="origin-select">Material Origin (Supply Chain Factor)</Label>
                    <Select
                        onValueChange={(v) => setForm({ ...form, origin: v })}
                        defaultValue={form.origin}
                    >
                        <SelectTrigger id="origin-select"><SelectValue placeholder="Origin" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Local">Local (Lower footprint)</SelectItem>
                            <SelectItem value="Imported">Imported (Higher footprint)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Label htmlFor="demand-select">Market Demand Level</Label>
                    <Select
                        onValueChange={(v) => setForm({ ...form, demandLevel: v })}
                        defaultValue={form.demandLevel}
                    >
                        <SelectTrigger id="demand-select"><SelectValue placeholder="Market Demand" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <Label htmlFor="material-cost-input">Material Cost (₹)</Label>
                    <Input
                        id="material-cost-input"
                        type="number"
                        placeholder="e.g., 500"
                        value={form.materialCost}
                        onChange={(e) => setForm({ ...form, materialCost: +e.target.value })}
                    />
                    <Label htmlFor="hours-spent-input">Hours Spent on Crafting (Labor)</Label>
                    <Input
                        id="hours-spent-input"
                        type="number"
                        placeholder="e.g., 5 hours"
                        value={form.hoursSpent}
                        onChange={(e) => setForm({ ...form, hoursSpent: +e.target.value })}
                    />
                </div>
                
                <div className="space-y-4 md:col-span-2">
                    <Label>Estimated Energy Used ({form.energyUsed} kWh)</Label>
                    <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[form.energyUsed]}
                        onValueChange={(v) => setForm({ ...form, energyUsed: v[0] })}
                        className="my-3"
                    />

                    <Label htmlFor="production-time-input">Production Time (Total hours in batch/process)</Label>
                    <Input
                        id="production-time-input"
                        type="number"
                        placeholder="e.g., 5 hours"
                        value={form.productionHours}
                        onChange={(e) => setForm({ ...form, productionHours: +e.target.value })}
                    />
                </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full text-lg h-12 bg-indigo-600 hover:bg-indigo-700 transition">
            {loading ? "Calculating Scores and Generating AI Tips..." : "💬 Generate AI Pricing & Sustainability Suggestions"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Error Display */}
      {error && (
        <Card className="border-t-4 border-red-500 shadow-xl">
            <CardHeader><CardTitle className="text-red-600">Calculation Error</CardTitle></CardHeader>
            <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Card className="shadow-2xl border-t-4 border-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 py-4">
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            
            {/* Pricing Summary (Large Display) */}
            <div className="border-b pb-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Pricing Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-xl shadow-lg border-2 border-indigo-400">
                        <p className="text-lg font-medium text-indigo-800 dark:text-indigo-200">Suggested Fair Price</p>
                        <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            ₹{formatNumber(result.suggestedPrice, 2)}
                        </p>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl shadow-md border border-indigo-300">
                        <p className="text-md font-medium text-indigo-700 dark:text-indigo-300">Negotiation Range</p>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                            ₹{formatNumber(result.negotiationRange?.[0], 2)} - ₹{formatNumber(result.negotiationRange?.[1], 2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Target to maximize profit while remaining competitive.</p>
                    </div>
                </div>
            </div>

            {/* Sustainability Scores (Grid) */}
            <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Environmental Impact Scores</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScoreMetric 
                        title="Overall Sustainability" 
                        value={formatNumber(result.totalScore, 1, 'N/A')} 
                        unit="/100" 
                        colorClass="text-green-600 dark:text-green-400"
                    />
                    <ScoreMetric 
                        title="Eco-Material Score" 
                        value={formatNumber(result.ecoScore, 1, 'N/A')} 
                        unit="/100" 
                        colorClass="text-teal-600 dark:text-teal-400"
                    />
                    <ScoreMetric 
                        title="Carbon Footprint" 
                        value={formatNumber(result.carbonFootprint, 2, 'N/A')} 
                        unit="kg CO₂e" 
                        colorClass="text-red-600 dark:text-red-400"
                    />
                    <ScoreMetric 
                        title="Demand Multiplier" 
                        value={result.demandLevel === "High" ? "High" : result.demandLevel === "Medium" ? "Medium" : "Low"} 
                        unit="" 
                        colorClass="text-yellow-600 dark:text-yellow-400"
                    />
                </div>
            </div>
            
            {/* AI Tips */}
            {/* AI Tips */}
<div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
    <Badge
      variant="secondary"
      className="mr-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    >
    </Badge>
    AI Tips for Improvement
  </h4>

  <div className="p-5 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-700 rounded-2xl shadow-md">
    {/* wrapper div gets the prose classes (no typing issues) */}
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {result.suggestion || "No suggestions generated."}
      </ReactMarkdown>
    </div>
  </div>
</div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
