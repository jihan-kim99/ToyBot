import { Message } from "@/app/types/chat";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

function decodeBase64(str: string) {
  // Convert base64 to raw binary data held in a string
  const binaryString = Buffer.from(str, "base64").toString("binary");
  return binaryString;
}

interface CharacterSettingProps {
  charaImage: string;
  setCharaImage: (value: string) => void;
  setSystemPrompt: (value: string) => void;
  setCharaAppearance: (value: string) => void;
  setMessages: (value: Message[]) => void;
}

interface CharacterData {
  name?: string;
  description?: string;
  personality?: string;
  mes_example?: string;
  scenario?: string;
  first_mes?: string;
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

const whatsappTheme = {
  primary: "#128C7E",
  secondary: "#075E54",
  lightGreen: "#25D366",
  background: "#ECE5DD",
  chatBackground: "#ffffff",
};

const ENDPOINT = "https://api.runpod.ai/v2/1uj9rvztdrkhhj/run";
const STATUS_ENDPOINT = "https://api.runpod.ai/v2/1uj9rvztdrkhhj/status/";
const API_KEY = process.env.NEXT_PUBLIC_RUNPOD_API_KEY;

interface RunPodOutput {
  image_url: string;
  [key: string]: unknown;
}

interface RunPodStatus {
  status: string;
  output?: RunPodOutput;
  error?: string;
}

const checkStatus = async (jobId: string): Promise<RunPodOutput | null> => {
  while (true) {
    const response = await fetch(`${STATUS_ENDPOINT}${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const status: RunPodStatus = await response.json();

    if (status.status === "COMPLETED" && status.output) {
      return status.output;
    } else if (status.status === "FAILED") {
      throw new Error(`Job failed: ${status.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const generateImage = async (prompt: string) => {
  try {
    const seed = Math.floor(Math.random() * 65535);
    const payload = {
      input: {
        prompt: `masterpiece, high quality, ${prompt}`,
        negative_prompt:
          "worst quality, low quality, text, censored, deformed, bad hand, watermark, 3d, wrinkle, bad face, bad anatomy",
        height: 1024,
        width: 1024,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        seed,
        high_noise_frac: 1,
        use_lora: false,
        lora_scale: 0.6,
        scheduler: "K_EULER",
      },
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
    const output = await checkStatus(result.id);

    if (!output || !output.image_url) {
      throw new Error("No image URL found in output");
    }

    return output.image_url;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const CharacterSetting = ({
  charaImage,
  setCharaImage,
  setSystemPrompt,
  setCharaAppearance,
  setMessages,
}: CharacterSettingProps) => {
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "",
    description: "",
    personality: "",
    mes_example: "",
    scenario: "",
    first_mes: "",
  });

  const [charaImagePrompt, setCharaImagePrompt] = useState("");

  const handleInputChange =
    (field: keyof CharacterData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCharacterData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSaveCharacter = () => {
    try {
      const systemPrompt = `Character: ${characterData.name}
Description: ${characterData.description}
Example message: ${characterData.mes_example}
Scenario: ${characterData.scenario}
      `;
      setSystemPrompt(systemPrompt);
      setCharaAppearance(charaImagePrompt);
      setMessages([
        {
          id: Date.now(),
          text: characterData.first_mes || "Hello!",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error saving character:", error);
    }
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
          setCharacterData(characterData);
          console.log("Processed character data:", characterData);
        } catch (e) {
          console.error("Data processing error:", e);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGenerateImage = async () => {
    if (!charaImagePrompt) return;

    const imageUrl = await generateImage(charaImagePrompt);
    if (imageUrl) {
      setCharaImage(imageUrl);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        my: 2,
        backgroundColor: whatsappTheme.background,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: whatsappTheme.primary,
          p: 2,
          mb: 2,
          mx: -3,
          mt: -3,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          Character Settings
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="file"
          accept=".png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) decodeCharacterCard(file);
          }}
          style={{ display: "none" }}
          id="character-upload"
        />
        <label htmlFor="character-upload">
          <Button
            variant="contained"
            component="span"
            sx={{
              mr: 2,
              backgroundColor: whatsappTheme.lightGreen,
              "&:hover": {
                backgroundColor: whatsappTheme.secondary,
              },
            }}
          >
            Import Character Card
          </Button>
        </label>
      </Box>

      <Stack
        spacing={2}
        sx={{
          backgroundColor: whatsappTheme.chatBackground,
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Image Prompt"
            value={charaImagePrompt}
            onChange={(e) => setCharaImagePrompt(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: whatsappTheme.primary,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: whatsappTheme.primary,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleGenerateImage}
            disabled={!charaImagePrompt}
            sx={{
              backgroundColor: whatsappTheme.lightGreen,
              "&:hover": {
                backgroundColor: whatsappTheme.secondary,
              },
            }}
          >
            Generate Image
          </Button>
        </Box>

        {charaImage && (
          <Box
            sx={{
              textAlign: "center",
              mt: 2,
              position: "relative",
              height: "200px",
            }}
          >
            <Image
              src={charaImage}
              alt="Character"
              fill
              style={{
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>
        )}

        <TextField
          label="Name"
          value={characterData.name}
          onChange={handleInputChange("name")}
          required
          sx={{
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
        <TextField
          label="Description"
          value={characterData.description}
          onChange={handleInputChange("description")}
          required
          multiline
          minRows={3}
          maxRows={6}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
        <TextField
          label="Personality"
          value={characterData.personality}
          onChange={handleInputChange("personality")}
          multiline
          minRows={2}
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
        <TextField
          label="Example Messages"
          value={characterData.mes_example}
          onChange={handleInputChange("mes_example")}
          multiline
          minRows={2}
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
        <TextField
          label="Scenario"
          value={characterData.scenario}
          onChange={handleInputChange("scenario")}
          multiline
          minRows={2}
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
        <TextField
          label="First Message"
          value={characterData.first_mes}
          onChange={handleInputChange("first_mes")}
          multiline
          minRows={1}
          maxRows={3}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: whatsappTheme.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: whatsappTheme.primary,
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          onClick={handleSaveCharacter}
          sx={{
            minWidth: 120,
            backgroundColor: whatsappTheme.lightGreen,
            "&:hover": {
              backgroundColor: whatsappTheme.secondary,
            },
          }}
        >
          Save Character
        </Button>
      </Box>
    </Paper>
  );
};
