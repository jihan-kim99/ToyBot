import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface SendButtonProps {
  onSubmit: () => void;
  disabled: boolean;
}

export const SendButton = ({ disabled, onSubmit }: SendButtonProps) => (
  <IconButton
    type="submit"
    disabled={disabled}
    sx={{
      bgcolor: "#075e54",
      color: "white",
      "&:hover": {
        bgcolor: "#054c44",
      },
      width: 48,
      height: 48,
    }}
    onClick={onSubmit}
  >
    <SendIcon />
  </IconButton>
);
