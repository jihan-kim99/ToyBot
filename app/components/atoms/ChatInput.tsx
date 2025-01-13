import { TextField } from "@mui/material";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const ChatInput = ({ value, onChange, disabled }: ChatInputProps) => (
  <TextField
    fullWidth
    value={value}
    onChange={onChange}
    disabled={disabled}
    autoComplete="off"
    placeholder="Type a message"
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "24px",
        bgcolor: "white",
      },
    }}
  />
);
