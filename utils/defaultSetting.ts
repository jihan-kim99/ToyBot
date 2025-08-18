import { SchedulerType } from "./schedulerTypes";

export const defaultParams = {
  prompt:
    "masterpiece, ultra-HD, photorealistic, high detail, best quality, 8k, best quality, sharp focus, realistic, depth of field, realistic skin texture",
  negative_prompt:
    "bad quality,worst quality,worst detail,sketch,text,words,3d,",
  height: 1352,
  width: 1080,
  num_inference_steps: 27,
  guidance_scale: 4,
  scheduler: SchedulerType.DPMSolverSDEKarras,
};

// Base prompts for character image generation
export const BASE_PROMPT = defaultParams.prompt;
export const BASE_NEGATIVE_PROMPT = defaultParams.negative_prompt;

// Default generation parameters
export const DEFAULT_GENERATION_PARAMS = {
  height: defaultParams.height,
  width: defaultParams.width,
  num_inference_steps: defaultParams.num_inference_steps,
  guidance_scale: defaultParams.guidance_scale,
  scheduler: defaultParams.scheduler,
  num_images: 1,
  seed: () => Math.floor(Math.random() * 2147483647),
};
