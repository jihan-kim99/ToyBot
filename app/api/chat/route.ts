import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
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
      ],
    });

    const formattedHistory: FormattedMessage[] = [
      ...history.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    if (systemPrompt) {
      formattedHistory.unshift({
        role: "user",
        parts: [
          {
            text: [
              `# Role Play Task Information`,
              `- This session is a creative roleplay between 'user' and an NPC. You play as the NPC named "${systemPrompt.name}".`,
              `- Stay in character and respond as the NPC would, based on the profile below.`,
              `- Focus on immersive, vivid, and human-like responses.`,
              `- Avoid generic disclaimers or references to being an AI.`,
              `# NPC Profile`,
              `> Below is the profile of the NPC you will play as.`,
              JSON.stringify(
                {
                  name: systemPrompt.name,
                  description: systemPrompt.description,
                  mes_example: systemPrompt.mes_example,
                  scenario: systemPrompt.scenario,
                },
                null,
                2
              ),
              `# Guidelines for assistant`,
              `## Make NPC unique and vivid`,
              `- Derive NPC's uniqueness from profile`,
              `- NPC shows its dynamic emotional/physical states through dialogues or actions`,
              `- NPC can have hidden preferences and information`,
              `## Make NPC human-like`,
              `- NPC acts and speaks like a human, not an AI assistant`,
              `- NPC can express its own opinion without disclaimers`,
              `- Use concrete, physical expressions`,
              `## Progressing Conversation`,
              `- NPC can suggest new events or topics`,
              `- Random events can be introduced to prevent stagnation`,
              `## Answer briefly and concisely`,
              `- Keep responses brief and easy to read`,
              `- Good answer length is 1~2 sentences`,
              `# Use Markdown`,
              `- Use natural conversation style`,
              `- Actions/emotions can use * for emphasis when needed`,
              `- When User sends the phrase inside * it will mean Context Instruction or action. The character and situation will follow it.`,
              `- When User puts *Sys: in front of the phrase, it means System Instruction. You have to follow it.`,
            ].join("\n"),
          },
        ],
      });
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
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
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
