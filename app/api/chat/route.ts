import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { buildSystemPrompt } from "@/utils/promptEngineering";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FormattedMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(request: Request) {
  try {
    const { message, history, systemPrompt } = await request.json();

    // Construct the system instruction using the Marinara preset logic
    const systemInstruction = systemPrompt
      ? buildSystemPrompt(systemPrompt)
      : undefined;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 2,
        topP: 0.95,
        topK: 0,
        maxOutputTokens: 65536,
      },
    });

    let formattedHistory: FormattedMessage[] = history
      .slice(-50)
      .map((msg: ChatMessage) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Gemini requires the first message in history to be from the user
    if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    // console.log(JSON.stringify(result, null, 2));

    const response = result.response;

    let text = "";
    try {
      text = response.text();
    } catch (error) {
      console.error("Error getting text from response:", error);
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason) {
        return NextResponse.json(
          { error: `Response blocked due to ${candidate.finishReason}` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    if (text.length === 0) {
      return NextResponse.json(
        { error: "Empty response from the model" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
