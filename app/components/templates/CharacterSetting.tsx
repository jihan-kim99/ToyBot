import { Box, Button, Typography, Paper } from "@mui/material";

import Image from "next/image";
import { useImageViewer } from "react-image-viewer-hook";

import { CharacterData } from "@/app/types/character";
import { Message } from "@/app/types/chat";
import decodeCharacterCard from "@/app/utils/decodeCharaCard";
import { generateImage } from "@/app/utils/generateImage";
import { useState, useCallback, DragEvent, SetStateAction } from "react";
import { CharacterForm } from "../molecules/CharacterForm";
import { StyledTextField } from "../atoms/StyledTextField";
import { whatsappTheme } from "@/app/theme/whatsapp";

interface CharacterSettingProps {
  charaImage: string;
  setCharaImage: (value: string) => void;
  systemPrompt: CharacterData;
  charaAppearance: string;
  setSystemPrompt: (value: SetStateAction<CharacterData>) => void;
  setCharaAppearance: (value: string) => void;
  setMessages: (value: Message[]) => void;
}

export const CharacterSetting = ({
  charaImage,
  setCharaImage,
  systemPrompt,
  setSystemPrompt,
  charaAppearance,
  setCharaAppearance,
  setMessages,
}: CharacterSettingProps) => {
  const [charaImagePrompt, setCharaImagePrompt] = useState(charaAppearance);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [characterData, setCharacterData] =
    useState<CharacterData>(systemPrompt);

  const { getOnClick, ImageViewer } = useImageViewer();

  const handleInputChange =
    (field: keyof CharacterData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCharacterData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSaveCharacter = () => {
    setSystemPrompt(characterData);
    const firstMessage: Message = {
      id: Date.now(),
      text: characterData.first_mes || "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([firstMessage]);
    setCharaAppearance(charaImagePrompt);
  };

  const handleGenerateImage = async () => {
    if (!charaImagePrompt) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(charaImagePrompt);
      if (imageUrl) setCharaImage(imageUrl);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".png")) return;

    const chara = await decodeCharacterCard(file);
    if (chara) setCharacterData(chara);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        my: 2,
        backgroundColor: whatsappTheme.background,
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
          position: "relative",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          sx={{
            position: "absolute",
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            border: "2px dashed",
            borderColor: isDragging ? whatsappTheme.lightGreen : "transparent",
            borderRadius: 2,
            pointerEvents: "none",
            transition: "border-color 0.2s ease",
          }}
        />
        <input
          type="file"
          accept=".png"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const chara = await decodeCharacterCard(file);
            if (chara) setCharacterData(chara);
          }}
          style={{ display: "none" }}
          id="character-upload"
        />
        <label htmlFor="character-upload">
          <Button
            variant="contained"
            component="span"
            sx={{
              backgroundColor: whatsappTheme.lightGreen,
              position: "relative",
              zIndex: 1,
            }}
          >
            Import Character Card
          </Button>
        </label>
      </Box>

      {/* Image generation section */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <StyledTextField
          label="Image Prompt"
          value={charaImagePrompt}
          onChange={(e) => setCharaImagePrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGenerateImage();
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleGenerateImage}
          disabled={!charaImagePrompt || isGenerating}
          sx={{ backgroundColor: whatsappTheme.lightGreen }}
        >
          Generate Image
        </Button>
        {
          <Typography variant="caption" sx={{ alignSelf: "center" }}>
            {isGenerating ? "Generating..." : ""}
          </Typography>
        }
      </Box>

      {charaImage && (
        <>
          <Box
            sx={{
              textAlign: "center",
              mb: 2,
              position: "relative",
              height: "200px",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "8px",
            }}
            onClick={getOnClick(charaImage)}
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
          <ImageViewer />
        </>
      )}

      <CharacterForm
        characterData={characterData}
        onFieldChange={handleInputChange}
      />

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSaveCharacter}
          sx={{ backgroundColor: whatsappTheme.lightGreen }}
        >
          Save Character
        </Button>
      </Box>
    </Paper>
  );
};
