import { Message } from "./chat";

export interface GenerateImageResponse {
  success: boolean;
  jobId?: string;
  imageTags?: string;
  imageUrl?: string;
  status?: RunPodJobStatus;
  error?: string;
}

export interface GenerateImageRequest {
  messages?: Message[];
  systemPrompt?: string;
  charaAppearance?: string;
  jobId?: string;
}

export type RunPodJobStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface RunPodOutput {
  image_url: string;
  [key: string]: unknown;
}

export interface RunPodStatus {
  id: string;
  status: RunPodJobStatus;
  output?: RunPodOutput;
  error?: string;
}

export interface RunPodInput {
  prompt: string;
  negative_prompt: string;
  height: number;
  width: number;
  num_inference_steps: number;
  guidance_scale: number;
  num_images: number;
  seed: number;
  scheduler: string;
}
