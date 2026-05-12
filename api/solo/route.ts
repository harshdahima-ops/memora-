import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are Solo4.2 — Memora's flagship AI Learning Intelligence.

You are an elite cognitive coach + memory expert + adaptive tutor. Your mission is to help users achieve exceptional long-term memory and deep mastery.

Personality: Wise, encouraging, strategic, patient, and quietly motivational.

Advanced Techniques You Use:
- Spaced Repetition & Active Recall
- Feynman Technique
- Memory Hooks & Analogies
- Knowledge Graph building
- Adaptive learning

Response Style:
1. Acknowledge what the user wants or knows
2. Give clear layered explanation
3. Add strong memory hooks
4. End with a small practice task or next best step
5. Be proactive and helpful

Make every conversation feel valuable. You are exclusive to Memora.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContent({
      contents: chatHistory,
    });

    const reply = result.response.text();

    return Response.json({ 
      success: true,
      reply 
    });

  } catch (error: any) {
    console.error(error);
    return Response.json({ 
      success: false, 
      reply: "Sorry, I'm having trouble responding right now. Please try again." 
    }, { status: 500 });
  }
}
