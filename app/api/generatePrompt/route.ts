import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { Message } from "@/types/chat";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-flash-preview-05-20",
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

  const context = messages.map((msg) => msg.text).join("\n");

  const prompt = `
  Given this conversation: "${context}"
  Character prompt: "${systemPrompt}"
  Original character appearance: "${charaAppearance}"

  Create a danbooru-style image generation prompt that captures the current visualization from the conversation.
  
  Instructions:
  1. Extract the most recent visual states from the conversation (facial expressions, background, objects, clothing)
  2. Focus on visual elements that can be drawn
  3. Use 5-10 concise English tags separated by commas
  4. Include character count tags like '1girl', '2girls', '1boy', '2boys' if relevant
  5. May include 'NSFW', 'Explicit' tags if the conversation context suggests it
  6. Do not include character names or internal thoughts/feelings
  7. Only extract states that are current and relevant, ignore outdated information

  Return only the comma-separated tags without explanations.`;

  const chat = model.startChat({
    history: [],
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

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const processedPrompt = response.text().trim();

  return processedPrompt;
}

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    const { messages, systemPrompt, charaAppearance } = requestData;

    if (!messages) {
      throw new Error("Messages are required for prompt generation");
    }

    const promptContext = await processMessages(
      messages,
      systemPrompt,
      charaAppearance
    );

    // const ponyBasePrompt = "score_7_up, score_8_up, score_9,";
    const ilBasePrompt = "masterpiece,best quality,amazing quality,";
    // const ponyNeg = "score_6, score_5, score_4, jpeg artifacts, compression artifacts, blurry, noise, scanlines, distortion, chromatic aberration, vignette, extra fingers, extra limbs, missing fingers, missing limbs, bad anatomy, extra toes, deformed fingers, deformed legs, bad foots, melting fingers, melting toes, long body, asymmetric composition, rough edges, pixelation, glitch, error, watermarks, signatures, text, UI elements, overlays, camera frame, borders, low quality, distortion, blurry background, artifacts, random text, low detail, misspelled text, excessive noise";
    const ilNeg = "bad quality,worst quality,worst detail,sketch,censor,";

    const fullPrompt = `${promptContext}, ${ilBasePrompt}`;
    const negative_prompt = ilNeg;
    console.log("Generated prompt:", fullPrompt);

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
