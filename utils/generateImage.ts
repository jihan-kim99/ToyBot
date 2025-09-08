import { SchedulerType } from "./schedulerTypes";
import { defaultParams } from "./defaultSetting";
import { ImageStyle } from "@/types/api";

interface GenerationParams {
  prompt: string;
  negative_prompt?: string;
  height?: number;
  width?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  seed?: number;
  scheduler?: SchedulerType;
  style?: ImageStyle;
}

export const generateImage = async (params: GenerationParams) => {
  try {
    const roundUpHeight =
      8 -
      ((params.height || defaultParams.height) % 8) +
      (params.height || defaultParams.height);
    const roundUpWidth =
      8 -
      ((params.width || defaultParams.width) % 8) +
      (params.width || defaultParams.width);
    // Initial generation request
    const result = await fetch("/api/imgGen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        height: roundUpHeight,
        width: roundUpWidth,
        num_inference_steps:
          params.num_inference_steps || defaultParams.num_inference_steps,
        guidance_scale: params.guidance_scale || defaultParams.guidance_scale,
        num_images: params.num_images || 1,
        seed: params.seed || Math.floor(Math.random() * 2147483647),
        scheduler: params.scheduler || defaultParams.scheduler,
        style: params.style || "realistic",
      }),
    });

    const data = await result.json();
    if (!data.success || !data.id) {
      throw new Error(data.error || "Failed to start generation");
    }

    // Poll for results
    while (true) {
      const statusResult = await fetch("/api/imgGen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.id,
          style: params.style || "realistic",
        }),
      });

      const statusData = await statusResult.json();

      if (statusData.status === "COMPLETED" && statusData.imageUrl) {
        return statusData.imageUrl;
      }

      if (statusData.status === "FAILED") {
        throw new Error(statusData.error || "Generation failed");
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
