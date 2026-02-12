import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateGoals } from "@/lib/services/goals";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const goals = await getOrCreateGoals(user.id);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Settings</h1>
      <SettingsForm defaults={goals} />
    </AppShell>
  );
}
