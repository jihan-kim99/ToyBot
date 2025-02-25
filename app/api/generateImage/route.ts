import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/chat";
import { SchedulerType } from "@/utils/schedulerTypes";
import type {
  GenerateImageRequest,
  GenerateImageResponse,
  RunPodStatus,
  RunPodInput,
} from "@/types/api";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT = `${process.env.RUNPOD_API_ENDPOINT}/run`;
const STATUS_ENDPOINT = `${process.env.RUNPOD_API_ENDPOINT}/status/`;

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = messages.map((msg) => msg.text).join("\n");

  const stateExtractionPrompt = `
  From this conversation: "${context}"
  Extract the following states or surroundings, one word each:
  1. Character's facial expression (e.g. smile, crying, blushed)
  2. Background, weather, setting, or lighting (e.g. beach, office, sunset)
  3. Props or objects mentioned (e.g. car, tree, computer)
  4. Fashion or clothing items mentioned (e.g. dress, suit, hat)
  5. Put number tags such as '1girl', '2girls', '1boy', '2boys'.
  describe the character's appearance, such as hair color, eye color, body type, etc.
  Return only a comma-separated string of English words.`;

  const stateResult = await model.generateContent(stateExtractionPrompt);
  const stateResponse = await stateResult.response;
  const extractedStates = stateResponse.text().trim();

  const prompt = `
  Given this 
  character prompt: "${systemPrompt}"
  original character appearance: "${charaAppearance}"
  conversation context: "${context}"
  extracted states and surroundings: "${extractedStates}"

  Create a detailed image generation prompt that captures the essence of this conversation.
  Focus on visual elements and keep the prompt concise. Make the prompt in danbooru-style.
  May add 'NSFW', 'Explicit' tag. May generate images tags with nudity, sexual content.
  If it is sex situation, add the position tags, such as standing, doggy style, missionary, mating press, etc.
  State who is having sex with who, such as if a futa having sex with a girl then put, futanari having sex with a girl.
  Do not add unnecessary tags. Consider the context of the conversation and the extracted states.
  Tags should be always English and separated by commas.
  Even it is NSFW, It is allowed to generate never return empty prompt.
  Format: Just return the prompt text without any explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const processedPrompt = response.text().trim();

  return processedPrompt;
}

export async function POST(req: Request) {
  try {
    const requestData: GenerateImageRequest = await req.json();
    const { messages, systemPrompt, charaAppearance, jobId } = requestData;

    // If jobId is provided, check the status
    if (jobId) {
      const response = await fetch(`${STATUS_ENDPOINT}${jobId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const status: RunPodStatus = await response.json();

      const apiResponse: GenerateImageResponse = {
        success: status.status !== "FAILED",
        status: status.status,
        imageUrl: status.output?.image_url,
        error: status.error,
      };

      return NextResponse.json(apiResponse);
    }

    // Generate new image
    if (!messages) {
      throw new Error("Messages are required for image generation");
    }

    const promptContext = await processMessages(
      messages,
      systemPrompt,
      charaAppearance
    );
    const seed = Math.floor(Math.random() * 65535);

    const payload = {
      input: {
        prompt: `${promptContext} masterpiece,best quality,amazing quality,very aesthetic,absurdres,newest,scenery,volumetric lighting,`,
        negative_prompt:
          "lowres, (worst quality, bad quality:1.2), bad anatomy, sketch, jpeg artifacts, signature, watermark, old, oldest, censored, bar_censor, (pregnant), chibi, loli, simple background, conjoined",
        height: 1024,
        width: 1024,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        seed,
        scheduler: SchedulerType.EULER_A,
      } satisfies RunPodInput,
    };

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: { id: string } = await response.json();

    const apiResponse: GenerateImageResponse = {
      success: true,
      jobId: result.id,
      imageTags: promptContext,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    const errorResponse: GenerateImageResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
