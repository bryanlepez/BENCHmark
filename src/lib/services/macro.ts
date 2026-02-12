import { EntryRow } from "@/types/database";

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function calculateTotals(entries: EntryRow[]): MacroTotals {
  return entries.reduce<MacroTotals>(
    (acc, entry) => ({
      calories: acc.calories + entry.calories_snapshot,
      proteinG: acc.proteinG + entry.protein_g_snapshot,
      carbsG: acc.carbsG + entry.carbs_g_snapshot,
      fatG: acc.fatG + entry.fat_g_snapshot
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
