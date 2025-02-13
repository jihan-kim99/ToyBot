import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Image";
import { SetStateAction, useState } from "react";
import Avatar from "@mui/material/Avatar";
import { CharacterSetting } from "../templates/CharacterSetting";
import { Message } from "@/types/chat";
import { CharacterData } from "@/types/character";
import { useImageViewer } from "react-image-viewer-hook";

interface ChatHeaderProps {
  charaImage: string;
  systemPrompt: CharacterData;
  onSystemPromptChange?: (value: SetStateAction<CharacterData>) => void;
  charaAppearance: string;
  onCharaAppearanceChange?: (value: string) => void;
  handleRestart: () => void;
  setCharaImage: (value: string) => void;
  setMessages: (value: Message[]) => void;
}

export const ChatHeader = ({
  charaImage,
  systemPrompt,
  onSystemPromptChange,
  onCharaAppearanceChange,
  handleRestart,
  setCharaImage,
  charaAppearance,
  setMessages,
}: ChatHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const { getOnClick, ImageViewer } = useImageViewer();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRestartConfirm = () => {
    handleRestart();
    setRestartDialogOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#075e54" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={charaImage || undefined}
              alt="Character"
              onClick={charaImage ? getOnClick(charaImage) : undefined}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                cursor: charaImage ? "pointer" : "default",
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {systemPrompt.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Online
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton
              color="inherit"
              onClick={() => setRestartDialogOpen(true)}
              aria-label="restart"
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              color="inherit"
              href="/generate"
              aria-label="character generator"
            >
              <AddIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleOpen}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <CharacterSetting
            charaImage={charaImage}
            charaAppearance={charaAppearance}
            setCharaImage={setCharaImage}
            systemPrompt={systemPrompt}
            setSystemPrompt={onSystemPromptChange || (() => {})}
            setCharaAppearance={onCharaAppearanceChange || (() => {})}
            setMessages={setMessages}
          />
        </Dialog>

        <Dialog
          open={restartDialogOpen}
          onClose={() => setRestartDialogOpen(false)}
        >
          <DialogTitle>Restart Chat</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to restart the chat?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRestartDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRestartConfirm}
              color="error"
              variant="contained"
            >
              Restart
            </Button>
          </DialogActions>
        </Dialog>
      </AppBar>
      <ImageViewer />
    </>
  );
};
