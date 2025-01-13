import { Box } from "@mui/material";
import { ChatInput } from "../atoms/ChatInput";
import { SendButton } from "../atoms/SendButton";

interface ChatFormProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatForm = ({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatFormProps) => (
  <Box
    component="form"
    onSubmit={onSubmit}
    sx={{
      p: 2,
      bgcolor: "#f0f0f0",
      display: "flex",
      gap: 1,
    }}
  >
    <ChatInput value={input} onChange={onInputChange} disabled={isLoading} />
    <SendButton disabled={isLoading} />
  </Box>
);
