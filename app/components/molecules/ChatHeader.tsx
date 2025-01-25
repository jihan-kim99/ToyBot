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
  TextField,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";

interface ChatHeaderProps {
  charaImage: string;
  systemPrompt: string;
  onSystemPromptChange?: (value: string) => void;
  charaAppearance: string;
  onCharaAppearanceChange?: (value: string) => void;
  handleRestart: () => void;
}

export const ChatHeader = ({
  charaImage,
  systemPrompt,
  onSystemPromptChange,
  charaAppearance,
  onCharaAppearanceChange,
  handleRestart,
}: ChatHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(systemPrompt);
  const [tempCharaAppearance, setTempCharaAppearance] =
    useState(charaAppearance);

  const handleSave = () => {
    onSystemPromptChange?.(tempSystemPrompt);
    onCharaAppearanceChange?.(tempCharaAppearance);
    setOpen(false);
  };

  const handleOpen = () => {
    setTempSystemPrompt(systemPrompt);
    setTempCharaAppearance(charaAppearance);
    setOpen(true);
  };

  const handleRestartConfirm = () => {
    handleRestart();
    setRestartDialogOpen(false);
  };

  const getCharacterName = () => {
    const match = systemPrompt.match(/Character:\s*(.*?)(?:\n|$)/);
    return match ? match[1].trim() : "ChatBot";
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#075e54" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={charaImage || undefined}
              alt="Character"
              sx={{
                width: 40,
                height: 40,
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {getCharacterName()}
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
              onClick={handleOpen}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="System Prompt"
            fullWidth
            multiline
            rows={4}
            value={tempSystemPrompt}
            onChange={(e) => setTempSystemPrompt(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Character Appearance"
            fullWidth
            multiline
            rows={2}
            value={tempCharaAppearance}
            onChange={(e) => setTempCharaAppearance(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
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
    </>
  );
};
