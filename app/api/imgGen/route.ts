import { NextResponse } from "next/server";
import { SchedulerType } from "@/utils/schedulerTypes";
import { RunPodInput } from "@/types/api";

const API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT = `${process.env.RUNPOD_API_ENDPOINT}/run`;
const STATUS_ENDPOINT = `${process.env.RUNPOD_API_ENDPOINT}/status/`;

export async function POST(req: Request) {
  try {
    const { id, ...params } = await req.json();

    // If id is provided, check status
    if (id) {
      const response = await fetch(`${STATUS_ENDPOINT}${id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const status = await response.json();

      return NextResponse.json({
        success: true,
        status: status.status,
        imageUrl:
          status.status === "COMPLETED" ? status.output?.image_url : null,
        error: status.error,
      });
    }

    // Otherwise, start new generation
    const {
      prompt,
      negative_prompt = "worst quality, low quality, text, censored, deformed, bad hand, watermark, 3d, wrinkle, bad face, bad anatomy",
      height = 1024,
      width = 1024,
      num_inference_steps = 30,
      guidance_scale = 7.5,
      num_images = 1,
      seed = Math.floor(Math.random() * 65535),
      scheduler = SchedulerType.EULER_A,
    } = params;

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
    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
