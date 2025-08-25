import { NextResponse } from "next/server";
import { RunPodInput } from "@/types/api";
import { defaultParams } from "@/utils/defaultSetting";

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
        delayTime: status.delayTime,
        executionTime: status.executionTime,
      });
    }

    // Otherwise, start new generation
    const {
      prompt,
      negative_prompt = defaultParams.negative_prompt,
      height = defaultParams.height,
      width = defaultParams.width,
      num_inference_steps = defaultParams.num_inference_steps,
      guidance_scale = defaultParams.guidance_scale,
      num_images = 1,
      seed = Math.floor(Math.random() * 65535),
      scheduler = defaultParams.scheduler,
    } = params;

    const payload = {
      input: {
        prompt,
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
