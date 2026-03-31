import { NextResponse } from "next/server";
import { syncAllCoursesToEngine } from "@/lib/sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Endpoint to manually trigger synchronization between MongoDB and Java.
 * This is useful during development or for ensuring consistency.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, count, error } = await syncAllCoursesToEngine();

    if (success) {
      return NextResponse.json({ message: "Sync successful", count }, { status: 200 });
    } else {
      return NextResponse.json({ error }, { status: 500 });
    }
  } catch (err) {
    console.error("[API] Sync error:", err);
    return NextResponse.json({ error: "Interal server error" }, { status: 500 }); // Fix typo: Interal -> Internal
  }
}
