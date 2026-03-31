import connectToDatabase from "./mongodb";
import Course from "@/models/Course";

/**
 * Fetches all courses from MongoDB and sends them to the Java Recommendation Engine
 * to ensure its in-memory list is up-to-date with community-submitted courses.
 */
export async function syncAllCoursesToEngine() {
  try {
    await connectToDatabase();
    const courses = await Course.find({}).lean();
    
    if (courses.length === 0) {
      console.log("[Sync] No community courses to sync.");
      return { success: true, count: 0 };
    }

    const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
    
    // Map MongoDB courses to the format expected by the Java engine
    const coursesToSync = courses.map(c => ({
      id: c._id.toString(),
      title: c.title,
      tags: c.tags
    }));

    const response = await fetch(`${engineUrl}/api/recommend/register-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coursesToSync),
    });

    if (response.ok) {
      console.log(`[Sync] Successfully synced ${courses.length} courses to Java Engine.`);
      return { success: true, count: courses.length };
    } else {
      console.error(`[Sync] Java Engine returned error: ${response.status}`);
      return { success: false, error: `Engine error: ${response.status}` };
    }
  } catch (error) {
    console.error("[Sync] Error during course synchronization:", error);
    return { success: false, error: String(error) };
  }
}
