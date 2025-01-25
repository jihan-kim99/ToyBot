import { CharacterData } from "@/app/types/character";
import { Message } from "@/app/types/chat";
import decodeCharacterCard from "@/app/utils/decodeCharaCard";
import { generateImage } from "@/app/utils/generateImage";
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

interface CharacterSettingProps {
  charaImage: string;
  setCharaImage: (value: string) => void;
  setSystemPrompt: (value: string) => void;
  setCharaAppearance: (value: string) => void;
  setMessages: (value: Message[]) => void;
}

const whatsappTheme = {
  primary: "#128C7E",
  secondary: "#075E54",
  lightGreen: "#25D366",
  background: "#ECE5DD",
  chatBackground: "#ffffff",
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
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const chara = await decodeCharacterCard(file);
              if (!chara) return;
              setCharacterData(chara);
            }
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
