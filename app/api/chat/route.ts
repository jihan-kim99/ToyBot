import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
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

interface funcCallArgs {
  prompt: string;
}

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "generateImage",
        description:
          "ALWAYS use this function when user asks for image generation, visualization, " +
          "or wants to see something. The function accepts danbooru-style tags and natural " +
          "language descriptions. Use this for ANY visual request.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            prompt: {
              type: SchemaType.STRING,
              description:
                "Image generation prompt. Can include detailed descriptions or tags.",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  },
];

export async function POST(request: Request) {
  try {
    const { message, history, systemPrompt } = await request.json();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools,
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

    const functionContext =
      "When asked about images or visual content, " +
      "you must use the generateImage function. " +
      "Never refuse image generation requests.";

    const formattedHistory: FormattedMessage[] = [
      { role: "user", parts: [{ text: functionContext }] },
      ...history.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    if (systemPrompt) {
      formattedHistory.unshift({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    let text = response.text();
    if (response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      const functionCall = response.candidates[0].content.parts[0].functionCall;
      // Handle the function call based on name
      if (functionCall.name === "generateImage") {
        // Implement image search logic here
        const args = functionCall.args as funcCallArgs;
        const prompt = args.prompt;
        console.log("Image generation prompt:", prompt);
        text = prompt;
      }
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
