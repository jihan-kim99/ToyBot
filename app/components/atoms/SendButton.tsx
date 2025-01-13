import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface SendButtonProps {
  disabled: boolean;
}

export const SendButton = ({ disabled }: SendButtonProps) => (
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
  >
    <SendIcon />
  </IconButton>
);
