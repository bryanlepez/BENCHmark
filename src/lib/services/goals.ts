import { createClient } from "@/lib/supabase/server";
import { goalSchema, type GoalInput } from "@/lib/validation";

const DEFAULT_GOALS = {
  calories_target: 2600,
  protein_target_g: 200,
  carbs_target_g: 250,
  fat_target_g: 70
};

export async function getOrCreateGoals(userId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from("goals")
    .insert({ user_id: userId, ...DEFAULT_GOALS })
    .select("*")
    .single();

  if (error || !created) {
    return {
      user_id: userId,
      ...DEFAULT_GOALS,
      updated_at: new Date().toISOString()
    };
  }

  return created;
}

export async function updateGoals(userId: string, payload: GoalInput) {
  const parsed = goalSchema.parse(payload);
  const supabase = await createClient();

  const { error } = await supabase
    .from("goals")
    .update({
      calories_target: parsed.caloriesTarget,
      protein_target_g: parsed.proteinTargetG,
      carbs_target_g: parsed.carbsTargetG,
      fat_target_g: parsed.fatTargetG
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error("Could not update goals");
  }
}
