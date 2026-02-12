import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addLogEntry, deleteLogEntry } from "@/lib/services/logs";
import { addEntrySchema } from "@/lib/validation";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const parsed = addEntrySchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }

      await addLogEntry(userId, parsed.data);
      revalidatePath("/dashboard");
      revalidatePath("/history");
      return NextResponse.json({ ok: true });
    }

    const formData = await request.formData();
    const methodOverride = formData.get("_method");
    if (methodOverride === "DELETE") {
      const entryId = String(formData.get("entryId") ?? "");
      if (!entryId) {
        return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
      }

      await deleteLogEntry(userId, entryId);
      revalidatePath("/dashboard");
      revalidatePath("/history");
      return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
    }

    return NextResponse.json({ error: "Unsupported request" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Log entry operation failed. Verify database schema and RLS are configured." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { entryId?: string } | null;
    const entryId = body?.entryId?.trim() ?? "";

    if (!entryId) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    await deleteLogEntry(userId, entryId);
    revalidatePath("/dashboard");
    revalidatePath("/history");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Delete failed. Verify database schema and RLS are configured." },
      { status: 500 }
    );
  }
}
