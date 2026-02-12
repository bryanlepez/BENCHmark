"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

interface SearchResult {
  id: string;
  name: string;
  brand: string | null;
  serving_unit: string;
  serving_size: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function AddFoodForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [measureMode, setMeasureMode] = useState<"serving" | "g" | "oz">("serving");

  const isGramBased = selected?.serving_unit.toLowerCase() === "g";

  const macrosPerUnit = useMemo(() => {
    if (!selected) {
      return null;
    }

    if (measureMode === "serving") {
      return {
        calories: selected.calories,
        protein: selected.protein_g,
        carbs: selected.carbs_g,
        fat: selected.fat_g,
        unitLabel: `${selected.serving_size}${selected.serving_unit}`
      };
    }

    const servingSize = selected.serving_size > 0 ? selected.serving_size : 1;
    const caloriesPerGram = selected.calories / servingSize;
    const proteinPerGram = selected.protein_g / servingSize;
    const carbsPerGram = selected.carbs_g / servingSize;
    const fatPerGram = selected.fat_g / servingSize;

    if (measureMode === "g") {
      return {
        calories: caloriesPerGram,
        protein: proteinPerGram,
        carbs: carbsPerGram,
        fat: fatPerGram,
        unitLabel: "1g"
      };
    }

    const gramsPerOz = 28.3495;
    return {
      calories: caloriesPerGram * gramsPerOz,
      protein: proteinPerGram * gramsPerOz,
      carbs: carbsPerGram * gramsPerOz,
      fat: fatPerGram * gramsPerOz,
      unitLabel: "1oz"
    };
  }, [measureMode, selected]);

  const scaled = useMemo(() => {
    if (!macrosPerUnit) {
      return null;
    }

    const qty = Number(quantity) || 0;

    return {
      calories: (macrosPerUnit.calories * qty).toFixed(1),
      protein: (macrosPerUnit.protein * qty).toFixed(1),
      carbs: (macrosPerUnit.carbs * qty).toFixed(1),
      fat: (macrosPerUnit.fat * qty).toFixed(1)
    };
  }, [macrosPerUnit, quantity]);

  async function handleSearch(nextQuery: string) {
    setQuery(nextQuery);
    setSelected(null);
    setMeasureMode("serving");
    setError(null);
    setInfo(null);

    if (nextQuery.length < 2) {
      setResults([]);
      return;
    }

    const response = await fetch(`/api/foods/search?q=${encodeURIComponent(nextQuery)}`);
    const json = (await response.json().catch(() => null)) as { items?: SearchResult[]; error?: string } | null;

    if (!response.ok) {
      setResults([]);
      setError(json?.error ?? "Search failed");
      return;
    }

    setResults(json?.items ?? []);
    if ((json?.items?.length ?? 0) === 0) {
      setInfo("No matching foods found.");
    }
  }

  async function addEntry() {
    if (!selected) {
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch("/api/log-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: selected.name,
          brand: selected.brand,
          quantity: Number(quantity),
          unit: measureMode === "serving" ? `serving (${selected.serving_size}${selected.serving_unit})` : measureMode,
          calories: macrosPerUnit?.calories ?? selected.calories,
          proteinG: macrosPerUnit?.protein ?? selected.protein_g,
          carbsG: macrosPerUnit?.carbs ?? selected.carbs_g,
          fatG: macrosPerUnit?.fat ?? selected.fat_g
        })
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Could not add entry");
      }

      setQuery("");
      setResults([]);
      setSelected(null);
      setQuantity("1");
      setMeasureMode("serving");
      pushToast("Entry added.");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not add entry";
      setError(message);
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded border border-line bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Food Search</h2>
      {error ? <p className="rounded border border-line bg-base p-2 text-sm">{error}</p> : null}
      {info ? <p className="rounded border border-line bg-base p-2 text-sm">{info}</p> : null}
      <input
        className="w-full rounded border border-line px-3 py-2"
        value={query}
        placeholder="Search food"
        onChange={(event) => {
          void handleSearch(event.target.value);
        }}
      />
      {results.length > 0 && (
        <ul className="max-h-48 overflow-auto rounded border border-line">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-base"
                onClick={() => {
                  setSelected(item);
                  setMeasureMode("serving");
                }}
              >
                <span>
                  {item.name}
                  {item.brand ? ` (${item.brand})` : ""}
                </span>
                <span className="text-xs text-gray-700">
                  {item.calories} kcal/{item.serving_size}
                  {item.serving_unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="space-y-3 rounded border border-line p-3">
          <p className="text-sm font-medium">Selected: {selected.name}</p>
          <label className="block text-sm">
            Amount
            <div className="mt-1 grid grid-cols-[1fr_120px] gap-2">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded border border-line px-2 py-1"
              />
              <select
                value={measureMode}
                onChange={(event) => setMeasureMode(event.target.value as "serving" | "g" | "oz")}
                className="rounded border border-line bg-white px-2 py-1 text-sm"
              >
                <option value="serving">Serving</option>
                {isGramBased ? <option value="g">g</option> : null}
                {isGramBased ? <option value="oz">oz</option> : null}
              </select>
            </div>
          </label>
          {macrosPerUnit ? (
            <p className="text-xs text-gray-700">
              Per {macrosPerUnit.unitLabel}: {macrosPerUnit.calories.toFixed(1)} kcal | P{" "}
              {macrosPerUnit.protein.toFixed(1)}g | C {macrosPerUnit.carbs.toFixed(1)}g | F {macrosPerUnit.fat.toFixed(1)}g
            </p>
          ) : null}
          {scaled && (
            <p className="text-sm">
              {scaled.calories} kcal | P {scaled.protein}g | C {scaled.carbs}g | F {scaled.fat}g
            </p>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void addEntry();
            }}
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add to Today"}
          </button>
        </div>
      )}
    </section>
  );
}
