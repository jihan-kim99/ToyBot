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
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

interface ChatHeaderProps {
  systemPrompt: string;
  onSystemPromptChange?: (value: string) => void;
}

export const ChatHeader = ({
  systemPrompt,
  onSystemPromptChange,
}: ChatHeaderProps) => {
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSystemPromptChange?.(systemPrompt);
    setOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#075e54" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">ChatBot</Typography>
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>System Prompt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter system prompt"
            fullWidth
            multiline
            rows={4}
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange?.(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
