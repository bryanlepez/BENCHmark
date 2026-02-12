import { z } from "zod";

export const goalSchema = z.object({
  caloriesTarget: z.coerce.number().int().min(1000).max(10000),
  proteinTargetG: z.coerce.number().int().min(50).max(500),
  carbsTargetG: z.coerce.number().int().min(30).max(1000),
  fatTargetG: z.coerce.number().int().min(20).max(300)
});

export const addEntrySchema = z.object({
  foodName: z.string().min(1).max(120),
  brand: z.string().max(120).nullable().optional(),
  quantity: z.coerce.number().min(0.1).max(20),
  unit: z.string().min(1).max(32),
  calories: z.coerce.number().min(0).max(5000),
  proteinG: z.coerce.number().min(0).max(500),
  carbsG: z.coerce.number().min(0).max(500),
  fatG: z.coerce.number().min(0).max(500)
});

export type AddEntryInput = z.infer<typeof addEntrySchema>;
export type GoalInput = z.infer<typeof goalSchema>;
