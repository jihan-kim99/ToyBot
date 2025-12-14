import { SchedulerType } from "./schedulerTypes";

export const defaultParams = {
  prompt:
    "masterpiece, ultra-HD, photorealistic, high detail, best quality, 8k, sharp focus, realistic, depth of field, realistic skin texture",
  negative_prompt:
    "bad quality, worst quality, worst detail, sketch, text, words, 3d",
  height: 1352,
  width: 1080,
  num_inference_steps: 27,
  guidance_scale: 4,
  scheduler: SchedulerType.DPMSolverSDEKarras,
};

export const defaultParamsAnime = {
  prompt:
    "masterpiece, best quality, amazing quality, 4k, very aesthetic, high resolution, ultra-detailed, absurdres, newest, scenery, {Prompt}, BREAK, depth of field, volumetric lighting",
  negative_prompt:
    "modern, recent, old, oldest, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured, long body, lowres, bad anatomy, bad hands, missing fingers, extra digits, fewer digits, cropped, very displeasing, (worst quality, bad quality:1.2), bad anatomy, sketch, jpeg artifacts, signature, watermark, username, signature, simple background, conjoined,bad ai-generated",
  height: 1440,
  width: 1024,
  num_inference_steps: 30,
  guidance_scale: 5,
  scheduler: SchedulerType.EULER_A,
};

// Base prompts for character image generation
export const BASE_PROMPT = defaultParams.prompt;
export const BASE_NEGATIVE_PROMPT = defaultParams.negative_prompt;

// Anime base prompts
export const BASE_PROMPT_ANIME = defaultParamsAnime.prompt;
export const BASE_NEGATIVE_PROMPT_ANIME = defaultParamsAnime.negative_prompt;

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
