import { AppShell } from "@/components/app-shell";
import { AddFoodForm } from "@/components/add-food-form";
import { EntriesList } from "@/components/entries-list";
import { ProgressBar } from "@/components/progress-bar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDailyLogEntries } from "@/lib/services/logs";
import { getOrCreateGoals } from "@/lib/services/goals";
import { calculateTotals } from "@/lib/services/macro";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let loadError: string | null = null;
  let entries = [] as Awaited<ReturnType<typeof getDailyLogEntries>>;
  let goals = {
    user_id: user.id,
    calories_target: 2600,
    protein_target_g: 200,
    carbs_target_g: 250,
    fat_target_g: 70,
    updated_at: new Date().toISOString()
  };

  try {
    [entries, goals] = await Promise.all([getDailyLogEntries(user.id), getOrCreateGoals(user.id)]);
  } catch {
    loadError =
      "Could not load dashboard data. Confirm the Supabase SQL migration has been applied (supabase/001_init.sql).";
  }

  const totals = calculateTotals(entries);

  return (
    <AppShell>
      <section className="mb-6 rounded border border-line bg-white p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-sm text-gray-700">Fast logging loop: search food, add quantity, stay on target.</p>
        {loadError ? <p className="rounded border border-line bg-base p-2 text-sm">{loadError}</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          <ProgressBar label="Calories" value={totals.calories} target={goals.calories_target} />
          <ProgressBar label="Protein" value={totals.proteinG} target={goals.protein_target_g} />
          <ProgressBar label="Carbs" value={totals.carbsG} target={goals.carbs_target_g} />
          <ProgressBar label="Fat" value={totals.fatG} target={goals.fat_target_g} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <AddFoodForm />

        <section className="rounded border border-line bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Today&apos;s Entries</h2>
          <EntriesList entries={entries} />
        </section>
      </div>
    </AppShell>
  );
}
