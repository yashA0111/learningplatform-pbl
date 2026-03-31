import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseName, courseTags } = await req.json();

    if (!courseName) {
      return NextResponse.json(
        { error: "courseName is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      You are an expert educational AI. Generate a 5-question multiple-choice diagnostic quiz to test a user's knowledge on the core concepts of the course "${courseName}"${courseTags?.length ? ` with context tags: ${courseTags.join(', ')}` : ""}.
      
      Output ONLY a valid JSON array of objects, with no markdown block formatting unless it's strictly the JSON inside the response. It MUST follow this specific schema:
      [
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The exact string from options that is correct",
          "conceptTested": "A 1-3 word phrase naming the core concept this question tests (e.g. 'React Hooks', 'Data Structures', 'REST APIs')"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const quizData = JSON.parse(text);

    return NextResponse.json({ questions: quizData });
  } catch (error: unknown) {
    console.error("Error generating quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate quiz", details: errorMessage },
      { status: 500 }
    );
  }
}
