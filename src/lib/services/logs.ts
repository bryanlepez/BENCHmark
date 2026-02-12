import { createClient } from "@/lib/supabase/server";
import { addEntrySchema, type AddEntryInput } from "@/lib/validation";
import { formatTodayDate } from "@/lib/services/date";
import { EntryRow } from "@/types/database";

export interface DailyLogWithEntries {
  id: string;
  logDate: string;
  entries: EntryRow[];
}

export async function getOrCreateDailyLog(userId: string, date = formatTodayDate()) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("daily_logs")
    .select("id, log_date")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from("daily_logs")
    .insert({ user_id: userId, log_date: date })
    .select("id, log_date")
    .single();

  if (error || !created) {
    throw new Error("Could not create daily log");
  }

  return created;
}

export async function getDailyLogEntries(userId: string, date = formatTodayDate()) {
  try {
    const supabase = await createClient();
    const dailyLog = await getOrCreateDailyLog(userId, date);

    const { data, error } = await supabase
      .from("log_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_log_id", dailyLog.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function addLogEntry(userId: string, payload: AddEntryInput) {
  const parsed = addEntrySchema.parse(payload);
  const supabase = await createClient();
  const dailyLog = await getOrCreateDailyLog(userId);

  const calories = parsed.calories * parsed.quantity;
  const protein = parsed.proteinG * parsed.quantity;
  const carbs = parsed.carbsG * parsed.quantity;
  const fat = parsed.fatG * parsed.quantity;

  const { error } = await supabase.from("log_entries").insert({
    user_id: userId,
    daily_log_id: dailyLog.id,
    food_name_snapshot: parsed.foodName,
    brand_snapshot: parsed.brand ?? null,
    quantity: parsed.quantity,
    unit: parsed.unit,
    calories_snapshot: Number(calories.toFixed(1)),
    protein_g_snapshot: Number(protein.toFixed(1)),
    carbs_g_snapshot: Number(carbs.toFixed(1)),
    fat_g_snapshot: Number(fat.toFixed(1))
  });

  if (error) {
    throw new Error("Could not add log entry");
  }
}

export async function deleteLogEntry(userId: string, entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("log_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Could not delete log entry");
  }
}

export async function getRecentLogs(userId: string) {
  const supabase = await createClient();
  const { data: logs, error: logsError } = await supabase
    .from("daily_logs")
    .select("id, log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(14);

  if (logsError || !logs) {
    return [] as DailyLogWithEntries[];
  }

  const withEntries = await Promise.all(
    logs.map(async (log) => {
      const { data: entries } = await supabase
        .from("log_entries")
        .select("*")
        .eq("daily_log_id", log.id)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      return {
        id: log.id,
        logDate: log.log_date,
        entries: entries ?? []
      };
    })
  );

  return withEntries;
}
