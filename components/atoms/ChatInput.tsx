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
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        onSubmit();
      }
    }}
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
