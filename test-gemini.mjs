import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await list.json();
    console.log("Available models:", data.models?.map(m => m.name).filter(n => n.includes("gemini")));
  } catch(e) {
    console.error(e);
  }
}
run();
