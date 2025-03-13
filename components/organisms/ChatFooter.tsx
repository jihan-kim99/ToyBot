import { Box } from "@mui/material";
import { ChatInput } from "../atoms/ChatInput";
import { SendButton } from "../atoms/SendButton";
import { ImageButton } from "../atoms/ImageButton";

interface ChatFooter {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onGenerateImage: () => void;
}

export const ChatFooter = ({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onGenerateImage,
}: ChatFooter) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "#f0f0f0",
      display: "flex",
      gap: 1,
    }}
  >
    <ImageButton disabled={isLoading} onClick={onGenerateImage} />
    <ChatInput value={input} onChange={onInputChange} onSubmit={onSubmit} />
    <SendButton disabled={isLoading} onSubmit={onSubmit} />
  </Box>
);
