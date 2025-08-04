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
import { ChatHistory, getCharacterChatHistories } from "@/utils/indexedDB";
import { ChatHistorySlider } from "../molecules/ChatHistorySlider";
import HistoryIcon from "@mui/icons-material/History";

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
  const [charaImageNegPrompt, setCharaImageNegPrompt] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);

  const [characterData, setCharacterData] =
    useState<CharacterData>(systemPrompt);
  const [originalCharacter, setOriginalCharacter] =
    useState<SavedCharacter | null>(null);

  const { getOnClick, ImageViewer } = useImageViewer();

  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  // Base prompt constants
  const BASE_PROMPT =
    "masterpiece, ultra-HD, photorealistic, high detail, best quality, 8k, best quality, sharp focus, ray-tracing, realistic, depth of field, shallow depth of field, raw photo ";
  const BASE_NEGATIVE_PROMPT =
    "bad quality,worst quality,worst detail,sketch,text,words,3d,";

  const handleAddBasePrompt = () => {
    setCharaImagePrompt((prev) =>
      prev ? `${BASE_PROMPT}, ${prev}` : BASE_PROMPT
    );
    setCharaImageNegPrompt((prev) =>
      prev ? `${BASE_NEGATIVE_PROMPT}, ${prev}` : BASE_NEGATIVE_PROMPT
    );
  };

  useEffect(() => {
    setSavedCharacters(getSavedCharacters());
  }, []);

  useEffect(() => {
    if (characterData.name) {
      getCharacterChatHistories(characterData.name)
        .then((histories) => setChatHistories(histories))
        .catch(console.error);
    }
  }, [characterData.name]);

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
        negative_prompt: charaImageNegPrompt || undefined,
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
      if (
        !file ||
        (!file.name.endsWith(".png") && !file.name.endsWith(".json"))
      )
        return;

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          Setting
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton
            onClick={() => setIsHistoryOpen(true)}
            sx={{ color: "white" }}
          >
            <HistoryIcon />
          </IconButton>
          <Button
            href="https://jannyai.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "white",
              "&:hover": {
                color: whatsappTheme.lightGreen,
              },
            }}
          >
            JanAI
          </Button>
          <Button
            href="https://chub.ai/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "white",
              "&:hover": {
                color: whatsappTheme.lightGreen,
              },
            }}
          >
            Chub
          </Button>
        </Box>
      </Box>

      <ChatHistorySlider
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        chatHistories={chatHistories}
        onSelectHistory={(messages) => {
          setMessages(messages);
          setSystemPrompt(characterData);
        }}
      />

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
          accept=".png,.json"
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
              Import Card or Json
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

      {/* Enhanced Image generation section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1">Image Generation</Typography>
          <IconButton
            onClick={() => setIsImageGenOpen(!isImageGenOpen)}
            sx={{ color: whatsappTheme.lightGreen }}
          >
            {isImageGenOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={isImageGenOpen}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: whatsappTheme.chatBackground,
              borderRadius: 2,
            }}
          >
            <StyledTextField
              label="Prompt"
              value={charaImagePrompt}
              onChange={(e) => setCharaImagePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleGenerateImage();
                }
              }}
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2 }}
            />
            <StyledTextField
              label="Negative Prompt"
              value={charaImageNegPrompt}
              onChange={(e) => setCharaImageNegPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleGenerateImage();
                }
              }}
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleAddBasePrompt}
                disabled={isGenerating}
                sx={{
                  color: whatsappTheme.lightGreen,
                  borderColor: whatsappTheme.lightGreen,
                }}
              >
                Add Base Prompts
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerateImage}
                disabled={!charaImagePrompt || isGenerating}
                sx={{ backgroundColor: whatsappTheme.lightGreen }}
              >
                {isGenerating ? "Generating..." : "Generate Image"}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Press Ctrl+Enter in prompt fields to generate • Base prompts add
              quality tags
            </Typography>
          </Box>
        </Collapse>
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
