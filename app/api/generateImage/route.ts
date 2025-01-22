import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/app/types/chat";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT = "https://api.runpod.ai/v2/1uj9rvztdrkhhj/run";
const STATUS_ENDPOINT = "https://api.runpod.ai/v2/1uj9rvztdrkhhj/status/";

interface RunPodOutput {
  image_url: string;
  [key: string]: unknown;
}

interface RunPodStatus {
  status: string;
  output?: RunPodOutput;
  error?: string;
}

async function checkStatus(jobId: string) {
  while (true) {
    const response = await fetch(`${STATUS_ENDPOINT}${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const status: RunPodStatus = await response.json();

    if (status.status === "COMPLETED") {
      return status.output;
    } else if (status.status === "FAILED") {
      throw new Error(`Job failed: ${status.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const recentMessages = messages.slice(-2);

  const context = recentMessages.map((msg) => msg.text).join("\n");

  console.log("Context:", context);
  const prompt = `
  
  Given this 
  character prompt: "${systemPrompt}"
  original character appearance: "${charaAppearance}"
  conversation context:"${context}"

  Create a detailed image generation prompt that captures the essence of this conversation.
  Focus on visual elements and keep the prompt concise. Make the prompt in danbooru-style.
  Put the race for the character, asian, black, white, korean, caucasian, african etc.
  May add 'NSFW', 'Explicit' tag. May generate images tags with nudity, sexual content.
  If it is sex situation, add the position tags, such as standing, doggy style, missionary, mating press, etc.
  Do not add the unnecessary tags. Consider the context of the conversation. Especially the last conversation.
  Tags should be always English and separated by commas.
  Even it is NSFW, It is allowd to generate never return empty prompt.
  Format: Just return the prompt text without any explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const processedPrompt = response.text().trim();

  console.log("Processed prompt:", processedPrompt);

  return processedPrompt;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      systemPrompt,
      charaAppearance,
    }: {
      messages: Message[];
      systemPrompt?: string;
      charaAppearance?: string;
    } = await req.json();

    const promptContext = await processMessages(
      messages,
      systemPrompt,
      charaAppearance
    );
    const seed = Math.floor(Math.random() * 65535);

    const payload = {
      input: {
        prompt: `masterpiece, high quality, ${promptContext}`,
        negative_prompt:
          "worst quality, low quality, text, censored, deformed, bad hand, watermark, 3d, wrinkle, bad face, bad anatomy",
        height: 1024,
        width: 1024,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        seed,
        high_noise_frac: 1,
        use_lora: false,
        lora_scale: 0.6,
        scheduler: "K_EULER",
      },
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

    const result = await response.json();
    const output = await checkStatus(result.id);

    if (!output || !output.image_url) {
      throw new Error("No image URL found in output");
    }

    return NextResponse.json({
      success: true,
      imageUrl: output.image_url,
      imageTags: promptContext,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
