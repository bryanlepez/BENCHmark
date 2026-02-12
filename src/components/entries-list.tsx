"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EntryRow } from "@/types/database";
import { useToast } from "@/components/toast-provider";

interface EntriesListProps {
  entries: EntryRow[];
}

export function EntriesList({ entries }: EntriesListProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(entryId: string) {
    setDeletingId(entryId);
    setError(null);

    try {
      const response = await fetch("/api/log-entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId })
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Delete failed");
      }

      pushToast("Entry deleted.");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Delete failed";
      setError(message);
      pushToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-700">No entries yet. Add your first meal to start tracking today.</p>;
  }

  return (
    <>
      {error ? <p className="mb-3 rounded border border-line bg-base p-2 text-sm">{error}</p> : null}
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded border border-line p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{entry.food_name_snapshot}</p>
                <p className="text-gray-700">
                  {entry.quantity} {entry.unit} | {entry.calories_snapshot} kcal
                </p>
                <p className="text-gray-700">
                  P {entry.protein_g_snapshot}g | C {entry.carbs_g_snapshot}g | F {entry.fat_g_snapshot}g
                </p>
              </div>
              <button
                type="button"
                className="rounded border border-line px-3 py-1 hover:bg-base disabled:opacity-60"
                disabled={deletingId === entry.id}
                onClick={() => {
                  void onDelete(entry.id);
                }}
              >
                {deletingId === entry.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
