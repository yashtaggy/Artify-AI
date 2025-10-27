"use client";

import { useState } from "react";

export default function CraftScore() {
  const [form, setForm] = useState({
    productName: "",
    productDesc: "",
    materials: [] as string[],
    origin: "Local",
    materialCost: 500,
    hoursSpent: 5,
    demandLevel: "Medium",
    energyUsed: 20,
    productionHours: 5,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const materialsList = [
    "Recycled Paper",
    "Natural Fibers",
    "Plastic",
    "Wood",
    "Glass",
    "Metal",
    "Clay",
    "Resin",
  ];

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/craft-score/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🎨 Craft Score: AI Sustainability & Pricing Assistant
      </h1>

      <div className="grid gap-3">
        <input
          placeholder="Product Name"
          value={form.productName}
          onChange={(e) => handleChange("productName", e.target.value)}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Product Description"
          value={form.productDesc}
          onChange={(e) => handleChange("productDesc", e.target.value)}
          className="p-2 border rounded"
        />
        <label>Materials Used:</label>
        <select
          multiple
          value={form.materials}
          onChange={(e) =>
            handleChange(
              "materials",
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
          className="p-2 border rounded"
        >
          {materialsList.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <label>Origin:</label>
        <select
          value={form.origin}
          onChange={(e) => handleChange("origin", e.target.value)}
          className="p-2 border rounded"
        >
          <option>Local</option>
          <option>Imported</option>
        </select>
        <input
          type="number"
          placeholder="Material Cost (₹)"
          value={form.materialCost}
          onChange={(e) => handleChange("materialCost", +e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Hours Spent"
          value={form.hoursSpent}
          onChange={(e) => handleChange("hoursSpent", +e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={form.demandLevel}
          onChange={(e) => handleChange("demandLevel", e.target.value)}
          className="p-2 border rounded"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          type="number"
          placeholder="Energy Used (kWh)"
          value={form.energyUsed}
          onChange={(e) => handleChange("energyUsed", +e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Production Time (hours)"
          value={form.productionHours}
          onChange={(e) => handleChange("productionHours", +e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Analyzing..." : "💬 Generate AI Insights"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <p>🎯 Suggested Fair Price: ₹{result.price.toFixed(2)}</p>
          <p>
            🤝 Negotiation Range: ₹{result.negotiation[0].toFixed(2)} - ₹
            {result.negotiation[1].toFixed(2)}
          </p>
          <p>🌿 Eco Material Score: {result.ecoScore.toFixed(1)}/100</p>
          <p>🏭 Carbon Footprint: {result.carbonFootprint} kg CO₂e</p>
          <p>💚 Sustainability Score: {result.totalScore.toFixed(1)}/100</p>
          <h3 className="text-lg font-semibold mt-4">💡 AI Tips</h3>
          <p>{result.suggestion}</p>
        </div>
      )}
    </div>
  );
}
