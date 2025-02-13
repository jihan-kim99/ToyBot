import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Collapse,
} from "@mui/material";
import Image from "next/image";
import { useImageViewer } from "react-image-viewer-hook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  useState,
  useCallback,
  DragEvent,
  SetStateAction,
  useEffect,
} from "react";

import { CharacterData } from "@/types/character";
import { Message } from "@/types/chat";
import decodeCharacterCard from "@/utils/decodeCharaCard";
import { generateImage } from "@/utils/generateImage";
import {
  SavedCharacter,
  getSavedCharacters,
  saveCharacterToStorage,
  deleteCharacter,
  isCharacterEqual,
} from "@/utils/localStorageUtils";
import { CharacterForm } from "../molecules/CharacterForm";
import { StyledTextField } from "../atoms/StyledTextField";
import { whatsappTheme } from "@/theme/whatsapp";
import { CardCarousel } from "../molecules/CardCarousel";

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
  const [originalCharacter, setOriginalCharacter] =
    useState<SavedCharacter | null>(null);

  const { getOnClick, ImageViewer } = useImageViewer();

  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  useEffect(() => {
    setSavedCharacters(getSavedCharacters());
  }, []);

  const handleLoadCharacter = (savedChar: SavedCharacter) => {
    setCharacterData(savedChar.data);
    if (savedChar.imageUrl) {
      setCharaImage(savedChar.imageUrl);
    }
    setOriginalCharacter(savedChar);
  };

  const handleDeleteCharacter = (id: string) => {
    const updatedCharacters = deleteCharacter(id);
    if (updatedCharacters) {
      setSavedCharacters(updatedCharacters);
    }
  };

  const handleInputChange =
    (field: keyof CharacterData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCharacterData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSaveCharacter = async () => {
    setSystemPrompt(characterData);
    const firstMessage: Message = {
      id: Date.now(),
      text: characterData.first_mes || "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([firstMessage]);
    setCharaAppearance(charaImagePrompt);

    // Check if we're trying to save an unchanged loaded character
    if (
      originalCharacter &&
      isCharacterEqual(characterData, originalCharacter.data) &&
      charaImage === originalCharacter.imageUrl
    ) {
      return; // Skip saving if nothing changed
    }

    const updatedCharacters = await saveCharacterToStorage(
      characterData,
      charaImage
    );
    if (updatedCharacters) {
      setSavedCharacters(updatedCharacters);
      // Update original character after successful save
      const savedChar = updatedCharacters[updatedCharacters.length - 1];
      setOriginalCharacter(savedChar);
    }
  };

  const handleGenerateImage = async () => {
    if (!charaImagePrompt) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateImage({
        prompt: charaImagePrompt,
      });
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

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file || !file.name.endsWith(".png")) return;

      const result = await decodeCharacterCard(file);
      if (result) {
        setCharacterData(result.characterData);
        setCharaImage(result.imageUrl);
      }
    },
    [setCharacterData, setCharaImage]
  );

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
            const result = await decodeCharacterCard(file);
            if (result) {
              setCharacterData(result.characterData);
              setCharaImage(result.imageUrl);
            }
          }}
          style={{ display: "none" }}
          id="character-upload"
        />
        <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
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
      </Box>

      {savedCharacters.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1">Saved Characters</Typography>
            <IconButton
              onClick={() => setIsCarouselOpen(!isCarouselOpen)}
              sx={{ color: whatsappTheme.lightGreen }}
            >
              {isCarouselOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={isCarouselOpen}>
            <CardCarousel
              characters={savedCharacters}
              onSelect={handleLoadCharacter}
              onDelete={handleDeleteCharacter}
            />
          </Collapse>
        </Box>
      )}

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
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          href="/generate"
          sx={{ backgroundColor: whatsappTheme.lightGreen }}
        >
          Generate Image only
        </Button>
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
