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

  const scaled = useMemo(() => {
    if (!selected) {
      return null;
    }

    const qty = Number(quantity) || 0;

    return {
      calories: (selected.calories * qty).toFixed(1),
      protein: (selected.protein_g * qty).toFixed(1),
      carbs: (selected.carbs_g * qty).toFixed(1),
      fat: (selected.fat_g * qty).toFixed(1)
    };
  }, [quantity, selected]);

  async function handleSearch(nextQuery: string) {
    setQuery(nextQuery);
    setSelected(null);
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
          unit: selected.serving_unit,
          calories: selected.calories,
          proteinG: selected.protein_g,
          carbsG: selected.carbs_g,
          fatG: selected.fat_g
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
            Quantity
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-1 w-full rounded border border-line px-2 py-1"
            />
          </label>
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
