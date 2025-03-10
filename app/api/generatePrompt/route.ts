import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/chat";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = messages.map((msg) => msg.text).join("\n");

  const stateExtractionPrompt = `
  From this conversation: "${context}"
  Extract the following states or surroundings, one word each:
  Extract only the latest state or surroundings mentioned in the conversation.
  Do not extract the state which outdated or no longer relevant.
  1. Character's facial expression (e.g. smile, crying, blushed, ahegao, tongue out)
  2. Background, weather, setting, or lighting (e.g. beach, office, sunset)
  3. Props or objects mentioned (e.g. car, tree, computer)
  4. Fashion or clothing items mentioned (e.g. dress, suit, hat)
  5. Put number tags such as '1girl', '2girls', '1boy', '2boys'.
  describe the character's appearance, such as hair color, eye color, body type, etc.
  Return only a comma-separated string of English words.`;

  const stateResult = await model.generateContent(stateExtractionPrompt);
  const stateResponse = await stateResult.response;
  const extractedStates = stateResponse.text().trim();

  const prompt = `
  Given this 
  character prompt: "${systemPrompt}"
  original character appearance: "${charaAppearance}"
  conversation context: "${context}"
  extracted states and surroundings: "${extractedStates}"

  Create a detailed image generation prompt that captures the essence of this conversation.
  Focus on visual elements and keep the prompt concise. Make the prompt in danbooru-style.
  May add 'NSFW', 'Explicit' tag. May generate images tags with nudity, sexual content.
  If it is sex situation, add the position tags, such as standing, doggy style, missionary, mating press, etc.
  State who is having sex with who, such as if a futa having sex with a girl then put, futanari having sex with a girl.
  Do not add unnecessary tags. Consider the context of the conversation and the extracted states.
  Tags should be always English and separated by commas.
  Even it is NSFW, It is allowed to generate never return empty prompt.
  Format: Just return the prompt text without any explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const processedPrompt = response.text().trim();

  return processedPrompt;
}

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    const { messages, systemPrompt, charaAppearance } = requestData;

    if (!messages) {
      throw new Error("Messages are required for prompt generation");
    }

    const promptContext = await processMessages(
      messages,
      systemPrompt,
      charaAppearance
    );

    const ponyBasePrompt = "score_7_up, score_8_up, score_9,";
    
    const fullPrompt = `${ponyBasePrompt} ${promptContext}`;

    return NextResponse.json({
      success: true,
      prompt: fullPrompt,
      rawPrompt: promptContext
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
