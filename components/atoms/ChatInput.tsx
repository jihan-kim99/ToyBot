import { TextField, InputAdornment, IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useState, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const ChatInput = ({ value, onChange, onSubmit }: ChatInputProps) => {
  const [isSysMode, setIsSysMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSysToggle = () => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const cursorPosition = input.selectionStart || 0;
    const newValue =
      value.slice(0, cursorPosition) + "[SYS] " + value.slice(cursorPosition);

    setIsSysMode(!isSysMode);

    // Create a synthetic event to update the input value
    const syntheticEvent = {
      target: {
        value: newValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);

    // Set cursor position after the inserted text
    setTimeout(() => {
      input.setSelectionRange(cursorPosition + 6, cursorPosition + 6);
    }, 0);
  };

  return (
    <TextField
      inputRef={inputRef}
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
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSysToggle}
                size="small"
                sx={{
                  color: isSysMode ? "#FFD700" : "#666",
                  "&:hover": {
                    color: "#FFD700",
                  },
                }}
              >
                {isSysMode ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "24px",
          bgcolor: "white",
        },
      }}
    />
  );
};
