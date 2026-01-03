import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { Message } from "@/types/chat";
import {
  BASE_PROMPT,
  BASE_NEGATIVE_PROMPT,
  BASE_PROMPT_ANIME,
  BASE_NEGATIVE_PROMPT_ANIME,
} from "@/utils/defaultSetting";
import {
  buildStateExtractionPrompt,
  buildImagePrompt,
} from "@/utils/promptEngineering";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string,
  basePrompt?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
  });

  const context = messages.map((msg) => msg.text).join("\n");

  const stateExtractionPrompt = buildStateExtractionPrompt(context);

  const stateResult = await model.generateContent(stateExtractionPrompt);
  const stateResponse = await stateResult.response;
  const extractedStates = stateResponse.text().trim();

  // console.log(extractedStates);

  const prompt = buildImagePrompt(
    systemPrompt || "",
    charaAppearance || "",
    context,
    extractedStates,
    basePrompt || ""
  );

  const result = await model.generateContent(prompt);
  const response = result.response;
  const processedPrompt = response.text().trim();

  return processedPrompt;
}

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    const { messages, systemPrompt, charaAppearance, style } = requestData;

    if (!messages) {
      throw new Error("Messages are required for prompt generation");
    }

    // Select base prompt based on style
    const isAnime = style === "anime";
    const ilBasePrompt = isAnime ? BASE_PROMPT_ANIME : BASE_PROMPT;
    const ilNeg = isAnime ? BASE_NEGATIVE_PROMPT_ANIME : BASE_NEGATIVE_PROMPT;

    const promptContext = await processMessages(
      messages,
      systemPrompt,
      charaAppearance,
      ilBasePrompt
    );

    const fullPrompt = promptContext;
    const negative_prompt = ilNeg;
    // console.log("Generated prompt:", fullPrompt);

    return NextResponse.json({
      success: true,
      prompt: fullPrompt,
      negative_prompt,
      rawPrompt: promptContext,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
