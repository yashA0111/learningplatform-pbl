"use client";

import { useEffect } from "react";

/**
 * A small utility component that pings the Java recommendation engine
 * and logs the status to the browser console for debugging.
 */
export function BackendConnectionLog() {
  useEffect(() => {
    const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
    
    async function checkConnection() {
      try {
        console.log(`%c[Backend Check] Attempting to connect to: ${engineUrl}`, "color: #3b82f6; font-weight: bold;");
        
        // We'll try a POST to by-interests with an empty array as a safe "ping"
        const response = await fetch(`${engineUrl}/api/recommend/by-interests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        });

        if (response.ok) {
          console.log("%c\u2705 Backend Connected Successfully!", "color: #10b981; font-weight: bold; font-size: 1.1rem;");
          const data = await response.json();
          console.log("[Backend Response Sample]:", data);
        } else {
          console.error(`%c\u274C Backend Connection Failed (Status: ${response.status})`, "color: #ef4444; font-weight: bold;");
        }
      } catch (error) {
        console.error("%c\u274C Backend Connection Error:", "color: #ef4444; font-weight: bold;", error);
        console.warn("Check if your Java Spring Boot engine is running on", engineUrl);
      }
    }

    checkConnection();
  }, []);

  return null; // This component doesn't render anything
}
