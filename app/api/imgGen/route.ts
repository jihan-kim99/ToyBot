import { NextResponse } from "next/server";
import { SchedulerType } from "@/utils/schedulerTypes";

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

interface RunPodInput {
  prompt: string;
  negative_prompt: string;
  height: number;
  width: number;
  num_inference_steps: number;
  guidance_scale: number;
  num_images: number;
  seed: number;
  use_lora: boolean;
  lora_scale: number;
  scheduler: SchedulerType;
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

export async function POST(req: Request) {
  try {
    const {
      prompt,
      negative_prompt = "worst quality, low quality, text, censored, deformed, bad hand, watermark, 3d, wrinkle, bad face, bad anatomy",
      height = 1024,
      width = 1024,
      num_inference_steps = 30,
      guidance_scale = 7.5,
      num_images = 1,
      seed = Math.floor(Math.random() * 65535),
      use_lora = false,
      lora_scale = 0.6,
      scheduler = SchedulerType.DPMSolverSDEKarras,
    } = await req.json();

    const payload = {
      input: {
        prompt: `masterpiece, high quality, ${prompt}`,
        negative_prompt,
        height,
        width,
        num_inference_steps,
        guidance_scale,
        num_images,
        seed,
        use_lora,
        lora_scale,
        scheduler,
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

    const result = await response.json();
    const output = await checkStatus(result.id);

    if (!output || !output.image_url) {
      throw new Error("No image URL found in output");
    }

    return NextResponse.json({
      success: true,
      imageUrl: output.image_url,
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
