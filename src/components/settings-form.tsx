"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

interface SettingsFormProps {
  defaults: {
    calories_target: number;
    protein_target_g: number;
    carbs_target_g: number;
    fat_target_g: number;
  };
}

export function SettingsForm({ defaults }: SettingsFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          caloriesTarget: formData.get("caloriesTarget"),
          proteinTargetG: formData.get("proteinTargetG"),
          carbsTargetG: formData.get("carbsTargetG"),
          fatTargetG: formData.get("fatTargetG")
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Could not save goals");
      }

      setInfo("Goals updated.");
      pushToast("Goals updated.");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not save goals";
      setError(message);
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-3 rounded border border-line bg-white p-4" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Daily Targets</h2>
      {error ? <p className="rounded border border-line bg-base p-2 text-sm">{error}</p> : null}
      {info ? <p className="rounded border border-line bg-base p-2 text-sm">{info}</p> : null}
      <label className="block text-sm">
        Calories
        <input
          name="caloriesTarget"
          type="number"
          defaultValue={defaults.calories_target}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Protein (g)
        <input
          name="proteinTargetG"
          type="number"
          defaultValue={defaults.protein_target_g}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Carbs (g)
        <input
          name="carbsTargetG"
          type="number"
          defaultValue={defaults.carbs_target_g}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Fats (g)
        <input
          name="fatTargetG"
          type="number"
          defaultValue={defaults.fat_target_g}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>
      <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
        {saving ? "Saving..." : "Save goals"}
      </button>
    </form>
  );
}
