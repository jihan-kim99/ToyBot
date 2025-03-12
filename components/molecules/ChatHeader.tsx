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
  Menu,
  MenuItem,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Image";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { SetStateAction, useState, useEffect } from "react";
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#075e54" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: "70%",
            }}
          >
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
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
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
              onClick={handleMenuOpen}
              aria-label="more options"
              aria-controls="header-menu"
              aria-haspopup="true"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="header-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={toggleFullScreen}>
                {isFullScreen ? (
                  <FullscreenExitIcon fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                {isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setRestartDialogOpen(true);
                }}
              >
                <CloseIcon fontSize="small" sx={{ mr: 1 }} />
                Restart Chat
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  window.location.href = "/generate";
                }}
              >
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                Generate Character
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleOpen();
                }}
              >
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Settings
              </MenuItem>
            </Menu>
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
