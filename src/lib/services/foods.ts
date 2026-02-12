import { createClient } from "@/lib/supabase/server";
import { FoodRow } from "@/types/database";
import { z } from "zod";

interface SeedFood {
  source_food_id: string;
  name: string;
  brand: string | null;
  serving_unit: string;
  serving_size: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const SEED_FOODS: SeedFood[] = [
  {
    source_food_id: "seed-chicken-breast",
    name: "Chicken Breast",
    brand: null,
    serving_unit: "g",
    serving_size: 100,
    calories: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6
  },
  {
    source_food_id: "seed-jasmine-rice",
    name: "Jasmine Rice (Cooked)",
    brand: null,
    serving_unit: "g",
    serving_size: 100,
    calories: 130,
    protein_g: 2.7,
    carbs_g: 28.2,
    fat_g: 0.3
  },
  {
    source_food_id: "seed-whole-egg",
    name: "Whole Egg",
    brand: null,
    serving_unit: "egg",
    serving_size: 1,
    calories: 72,
    protein_g: 6.3,
    carbs_g: 0.4,
    fat_g: 4.8
  },
  {
    source_food_id: "seed-oats",
    name: "Rolled Oats",
    brand: null,
    serving_unit: "g",
    serving_size: 40,
    calories: 150,
    protein_g: 5,
    carbs_g: 27,
    fat_g: 3
  },
  {
    source_food_id: "seed-greek-yogurt",
    name: "Greek Yogurt (Nonfat)",
    brand: null,
    serving_unit: "g",
    serving_size: 170,
    calories: 100,
    protein_g: 17,
    carbs_g: 6,
    fat_g: 0
  },
  {
    source_food_id: "seed-almond-butter",
    name: "Almond Butter",
    brand: null,
    serving_unit: "tbsp",
    serving_size: 1,
    calories: 98,
    protein_g: 3.4,
    carbs_g: 3.4,
    fat_g: 9
  }
];

const openFoodFactsResponseSchema = z.object({
  products: z
    .array(
      z.object({
        code: z.string().optional(),
        product_name: z.string().optional(),
        brands: z.string().optional(),
        nutriments: z
          .object({
            "energy-kcal_100g": z.number().optional(),
            proteins_100g: z.number().optional(),
            carbohydrates_100g: z.number().optional(),
            fat_100g: z.number().optional()
          })
          .partial()
          .optional()
      })
    )
    .optional()
});

async function seedIfNeeded() {
  const supabase = await createClient();

  const { count } = await supabase
    .from("foods_cached")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return;
  }

  await supabase.from("foods_cached").insert(
    SEED_FOODS.map((food) => ({
      source: "seed",
      ...food
    }))
  );
}

async function searchExternalFoods(query: string) {
  const encoded = encodeURIComponent(query);
  const response = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=20`,
    {
      headers: {
        "User-Agent": process.env.OPENFOODFACTS_USER_AGENT ?? "BENCHmark/0.1.0 (dev)"
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return [] as SeedFood[];
  }

  const rawJson = await response.json().catch(() => null);
  const parsed = openFoodFactsResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    return [];
  }

  return (parsed.data.products ?? [])
    .map((product) => {
      const name = product.product_name?.trim();
      const sourceFoodId = product.code?.trim();
      if (!name || !sourceFoodId) {
        return null;
      }

      const calories = product.nutriments?.["energy-kcal_100g"];
      const protein = product.nutriments?.proteins_100g;
      const carbs = product.nutriments?.carbohydrates_100g;
      const fat = product.nutriments?.fat_100g;

      return {
        source_food_id: `off-${sourceFoodId}`,
        name,
        brand: product.brands?.trim() || null,
        serving_unit: "g",
        serving_size: 100,
        calories: Number((calories ?? 0).toFixed(1)),
        protein_g: Number((protein ?? 0).toFixed(1)),
        carbs_g: Number((carbs ?? 0).toFixed(1)),
        fat_g: Number((fat ?? 0).toFixed(1))
      } satisfies SeedFood;
    })
    .filter((food): food is SeedFood => food !== null)
    .slice(0, 20);
}

export async function searchFoods(query: string): Promise<FoodRow[]> {
  if (query.length < 2) {
    return [];
  }

  await seedIfNeeded();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods_cached")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(20);

  if (error) {
    return [];
  }

  if (data.length > 0) {
    return data;
  }

  try {
    const externalFoods = await searchExternalFoods(query);
    if (externalFoods.length === 0) {
      return [];
    }

    await supabase.from("foods_cached").upsert(
      externalFoods.map((food) => ({
        source: "openfoodfacts",
        ...food
      })),
      { onConflict: "source_food_id", ignoreDuplicates: true }
    );

    const { data: cachedExternal } = await supabase
      .from("foods_cached")
      .select("*")
      .in(
        "source_food_id",
        externalFoods.map((food) => food.source_food_id)
      )
      .order("name")
      .limit(20);

    return cachedExternal ?? [];
  } catch {
    return [];
  }
}
