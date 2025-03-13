import { TextField } from "@mui/material";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const ChatInput = ({ value, onChange, onSubmit }: ChatInputProps) => (
  <TextField
    fullWidth
    multiline
    maxRows={3}
    value={value}
    onChange={onChange}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    }}
    placeholder="Type a message"
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "24px",
        bgcolor: "white",
      },
    }}
  />
);
