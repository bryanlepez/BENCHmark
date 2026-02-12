import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecentLogs } from "@/lib/services/logs";
import { calculateTotals } from "@/lib/services/macro";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const logs = await getRecentLogs(user.id);

  return (
    <AppShell>
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-gray-700">Past 14 days of logged entries and totals.</p>
        {logs.length === 0 ? (
          <p className="rounded border border-line bg-white p-4 text-sm">
            No historical logs yet. Start by adding food on your dashboard.
          </p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => {
              const totals = calculateTotals(log.entries);
              return (
                <li key={log.id} className="rounded border border-line bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{log.logDate}</p>
                    <p className="text-sm text-gray-700">
                      {totals.calories.toFixed(0)} kcal | P {totals.proteinG.toFixed(0)} | C {totals.carbsG.toFixed(0)} | F{" "}
                      {totals.fatG.toFixed(0)}
                    </p>
                  </div>
                  {log.entries.length === 0 ? (
                    <p className="text-sm text-gray-700">No entries logged for this day.</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {log.entries.map((entry) => (
                        <li key={entry.id}>
                          {entry.food_name_snapshot} ({entry.quantity} {entry.unit})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
