import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { BASE_PROMPT_ANIME } from "@/utils/defaultSetting";
import { ImageStyle } from "@/types/api";

interface PromptDialogProps {
  isOpen: boolean;
  prompt: string;
  onClose: () => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  style: ImageStyle;
  onStyleChange: (style: ImageStyle) => void;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  prompt,
  onClose,
  onPromptChange,
  onGenerate,
  isGenerating,
  style,
  onStyleChange,
}) => {
  const handleAddBasePrompt = () => {
    const newPrompt = prompt
      ? `${BASE_PROMPT_ANIME}, ${prompt}`
      : BASE_PROMPT_ANIME;
    onPromptChange(newPrompt);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={isGenerating ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Edit Image Generation Prompt</DialogTitle>

      <DialogContent>
        {/* Style selector */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ToggleButtonGroup
            value={style}
            exclusive
            onChange={(_, newStyle) => {
              if (newStyle !== null) {
                onStyleChange(newStyle as ImageStyle);
              }
            }}
            aria-label="image style"
          >
            <ToggleButton value="realistic" aria-label="realistic style">
              Realistic
            </ToggleButton>
            <ToggleButton value="anime" aria-label="anime style">
              Anime
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          variant="outlined"
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleAddBasePrompt}
          disabled={isGenerating}
          color="secondary"
          variant="outlined"
        >
          Add Base Prompt
        </Button>
        <Button onClick={onClose} disabled={isGenerating} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          color="primary"
          variant="contained"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptDialog;
