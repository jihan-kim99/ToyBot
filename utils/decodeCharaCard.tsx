import type { CharacterData } from "../types/character";

function decodeBase64(str: string) {
  // Convert base64 to raw binary data held in a string
  const binaryString = Buffer.from(str, "base64").toString("binary");
  return binaryString;
}

const processCharacterData = (characterData: CharacterData) => {
  // Required fields
  if (!characterData.name || !characterData.description) {
    throw new Error("Name and description are required");
  }

  // Optional fields with defaults
  const processedData = {
    name: characterData.name.trim(),
    description: characterData.description.trim(),
    mes_example: characterData.mes_example?.trim() || "",
    scenario: characterData.scenario?.trim() || "No specific scenario",
    first_mes: characterData.first_mes?.trim() || "Hello!",
  };

  return processedData;
};

const decodeCharacterCard = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Find tEXtchara position
    let start = -1;
    for (let i = 0; i < bytes.length - 8; i++) {
      if (
        bytes[i] === 0x74 &&
        bytes[i + 1] === 0x45 &&
        bytes[i + 2] === 0x58 &&
        bytes[i + 3] === 0x74 &&
        bytes[i + 4] === 0x63 &&
        bytes[i + 5] === 0x68 &&
        bytes[i + 6] === 0x61 &&
        bytes[i + 7] === 0x72 &&
        bytes[i + 8] === 0x61
      ) {
        start = i + 9;
        break;
      }
    }

    let end = -1;
    for (let i = start; i < bytes.length - 4; i++) {
      if (
        bytes[i] === 0x49 &&
        bytes[i + 1] === 0x45 &&
        bytes[i + 2] === 0x4e &&
        bytes[i + 3] === 0x44
      ) {
        end = i;
        break;
      }
    }

    if (start > -1 && end > -1) {
      const rawData = bytes.slice(start, end);
      const base64Text = new TextDecoder().decode(rawData);

      try {
        const jsonStr = decodeBase64(base64Text);
        const rawCharacterData = JSON.parse(jsonStr);
        const characterData = processCharacterData(rawCharacterData);
        // setCharacterData(characterData);
        return characterData;
      } catch (e) {
        console.error("Data processing error:", e);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default decodeCharacterCard;
