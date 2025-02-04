import { IconButton } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

interface ImageButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export const ImageButton = ({ disabled, onClick }: ImageButtonProps) => (
  <IconButton
    type="button"
    disabled={disabled}
    onClick={onClick}
    sx={{
      bgcolor: "#128C7E",
      color: "white",
      "&:hover": {
        bgcolor: "#0E7268",
      },
      width: 48,
      height: 48,
    }}
  >
    <ImageIcon />
  </IconButton>
);
