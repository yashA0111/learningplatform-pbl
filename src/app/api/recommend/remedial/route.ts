import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { weakPoints, courseName } = await req.json();

    if (!weakPoints || !Array.isArray(weakPoints) || weakPoints.length === 0) {
      return NextResponse.json(
        { error: "weakPoints array is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      You are an expert personalized course recommendation engine. A user recently failed some concepts in a quiz about "${courseName || 'a subject'}".
      Their weak points are: ${weakPoints.join(', ')}.
      
      Suggest 2 to 3 specifically tailored "mini-courses" or resources that focus ONLY on closing these gaps.
      Return ONLY a valid JSON array of objects.
      Schema:
      [
        {
          "id": "A unique string ID",
          "title": "Course Title targeting the weak points",
          "platform": "Platform name (e.g. YouTube, Medium, Coursera)",
          "url": "A real or realistic-looking URL",
          "tags": ["Array of 3-4 specific skill tags"]
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const recommendationsData = JSON.parse(text);

    return NextResponse.json({ recommendations: recommendationsData });
  } catch (error: unknown) {
    console.error("Error generating remedial recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: errorMessage },
      { status: 500 }
    );
  }
}
