import { Message } from "@/app/types/chat";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { useState } from "react";

function decodeBase64(str: string) {
  // Convert base64 to raw binary data held in a string
  const binaryString = Buffer.from(str, "base64").toString("binary");
  return binaryString;
}

interface CharacterSettingProps {
  setSystemPrompt: (value: string) => void;
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

export const CharacterSetting = ({
  setSystemPrompt,
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
      const processed = processCharacterData(characterData);
      const systemPrompt = `Character: ${processed.name}
Description: ${processed.description}
Example message: ${processed.mes_example}
Scenario: ${processed.scenario}
      `;
      setSystemPrompt(systemPrompt);
      setMessages([
        {
          id: Date.now(),
          text: processed.first_mes,
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
          setCharacterData(rawCharacterData); // Update form with imported data
          const characterData = processCharacterData(rawCharacterData);
          console.log("Processed character data:", characterData);

          const systemPrompt = `Character: ${characterData.name}
            Description: ${characterData.description}
            Example message: ${characterData.mes_example}
            Scenario: ${characterData.scenario}
          `;
          setSystemPrompt(systemPrompt);
          setMessages([
            {
              id: Date.now(),
              text: characterData.first_mes,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        } catch (e) {
          console.error("Data processing error:", e);
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
