import { TextField } from "@mui/material";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  onSubmit: () => void;
}

export const ChatInput = ({
  value,
  onChange,
  disabled,
  onSubmit,
}: ChatInputProps) => (
  <TextField
    fullWidth
    value={value}
    onChange={onChange}
    disabled={disabled}
    autoComplete="new-password"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
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
