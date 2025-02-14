import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { ChatHistory } from "@/utils/indexedDB";
import { Message } from "@/types/chat";
import { whatsappTheme } from "@/theme/whatsapp";

interface ChatHistorySliderProps {
  open: boolean;
  onClose: () => void;
  chatHistories: ChatHistory[];
  onSelectHistory: (messages: Message[]) => void;
}

export const ChatHistorySlider = ({
  open,
  onClose,
  chatHistories,
  onSelectHistory,
}: ChatHistorySliderProps) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          backgroundColor: whatsappTheme.background,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Chat History
        </Typography>
        <List>
          {chatHistories.map((history) => (
            <ListItem key={history.id} disablePadding>
              <ListItemButton
                onClick={() => {
                  onSelectHistory(history.messages);
                  onClose();
                }}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: whatsappTheme.background,
                  "&:hover": {
                    backgroundColor: whatsappTheme.lightGreen,
                  },
                }}
              >
                <ListItemText
                  primary={history.characterName}
                  secondary={new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(history.lastUpdated))}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {chatHistories.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              No chat history available
            </Typography>
          )}
        </List>
      </Box>
    </Drawer>
  );
};
