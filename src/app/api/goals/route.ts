import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validation";
import { updateGoals } from "@/lib/services/goals";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await updateGoals(user.id, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Goal update failed. Verify database schema and RLS are configured." },
      { status: 500 }
    );
  }
}
