import { TextField, TextFieldProps } from "@mui/material";
import { whatsappTheme } from "@/app/theme/whatsapp";

export const StyledTextField = (props: TextFieldProps) => (
  <TextField {...props} sx={{ ...whatsappTheme.textField, ...props.sx }} />
);
