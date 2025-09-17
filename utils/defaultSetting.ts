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
    "highres, hi res, best quality, masterpiece, anime coloring, anime screencap, shiny skin, TRexStyle",
  negative_prompt:
    "bad quality, worst quality, worst detail, sketch, text, words, 3d",
  height: 1440,
  width: 1024,
  num_inference_steps: 23,
  guidance_scale: 7,
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
