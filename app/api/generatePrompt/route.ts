import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/chat";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function processMessages(
  messages: Message[],
  systemPrompt?: string,
  charaAppearance?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = messages.map((msg) => msg.text).join("\n");

  const stateExtractionPrompt = `
  From this conversation: "${context}"
  Extract the following states or surroundings, one word each:
  Extract only the most recent state or surroundings mentioned in the conversation.
  Do not extract the state which outdated or no longer relevant.
  1. Character's facial expression (e.g. smile, crying, blushed, ahegao, tongue out)
  2. Background, weather, setting, or lighting (e.g. beach, office, sunset)
  3. Props or objects mentioned (e.g. car, tree, computer)
  4. Fashion or clothing items mentioned (e.g. dress, suit, hat)
  5. Put number tags such as '1girl', '2girls', '1boy', '2boys'.
  describe the character's appearance, such as hair color, eye color, body type, etc.
  Return only comma-separated string of English words.`;

  const stateResult = await model.generateContent(stateExtractionPrompt);
  const stateResponse = await stateResult.response;
  const extractedStates = stateResponse.text().trim();

  console.log(extractedStates);

  const prompt = `
  Given this 
  character prompt: "${systemPrompt}"
  original character appearance: "${charaAppearance}"
  conversation context: "${context}"
  extracted states and surroundings: "${extractedStates}"

  Create a image generation prompt that captures current visualization.
  Focus on visual elements and keep the prompt concise. Make the prompt in danbooru-style.
  Make roughly around 5 to 10 tags.
  Do not add unnecessary tags which cannot be drawn. Consider the context of the conversation and the extracted states.
  Do not add any name of the characters.
  Do not put any internal thoughts or feelings of the characters.
  May add 'NSFW', 'Explicit' tag. May generate images tags with nudity, sexual content.
  Tags should be always English and separated by commas.
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

    // const ponyBasePrompt = "score_7_up, score_8_up, score_9,";
    const ilBasePrompt = "masterpiece,best quality,amazing quality,";
    // const ponyNeg = "score_6, score_5, score_4, jpeg artifacts, compression artifacts, blurry, noise, scanlines, distortion, chromatic aberration, vignette, extra fingers, extra limbs, missing fingers, missing limbs, bad anatomy, extra toes, deformed fingers, deformed legs, bad foots, melting fingers, melting toes, long body, asymmetric composition, rough edges, pixelation, glitch, error, watermarks, signatures, text, UI elements, overlays, camera frame, borders, low quality, distortion, blurry background, artifacts, random text, low detail, misspelled text, excessive noise";
    const ilNeg = "bad quality,worst quality,worst detail,sketch,censor,";

    const fullPrompt = `${promptContext}, ${ilBasePrompt}`;
    const negative_prompt = ilNeg;
    console.log("Generated prompt:", fullPrompt);

    return NextResponse.json({
      success: true,
      prompt: fullPrompt,
      negative_prompt,
      rawPrompt: promptContext,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
