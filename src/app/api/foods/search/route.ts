import { NextResponse } from "next/server";
import { searchFoods } from "@/lib/services/foods";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();

    const items = await searchFoods(q);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Food search failed", items: [] }, { status: 500 });
  }
}
