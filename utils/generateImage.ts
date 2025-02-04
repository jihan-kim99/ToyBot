import { SchedulerType } from "./schedulerTypes";

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
}

export const generateImage = async (params: GenerationParams) => {
  try {
    const result = await fetch("/api/imgGen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        height: params.height || 1024,
        width: params.width || 1024,
        num_inference_steps: params.num_inference_steps || 28,
        guidance_scale: params.guidance_scale || 5.5,
        num_images: params.num_images || 1,
        seed: params.seed || Math.floor(Math.random() * 2147483647),
        scheduler: params.scheduler || SchedulerType.EULER_A,
      }),
    });

    const data = await result.json();
    if (!data.success || !data.imageUrl) {
      throw new Error(data.error || "Failed to generate image");
    }
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
