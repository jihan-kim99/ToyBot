import { CharacterData } from "@/types/character";
import { Stack } from "@mui/material";
import { StyledTextField } from "../atoms/StyledTextField";
import { whatsappTheme } from "@/theme/whatsapp";

interface CharacterFormProps {
  characterData: CharacterData;
  onFieldChange: (
    field: keyof CharacterData
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const CharacterForm = ({
  characterData,
  onFieldChange,
}: CharacterFormProps) => (
  <Stack
    spacing={2}
    sx={{
      backgroundColor: whatsappTheme.chatBackground,
      p: 2,
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <StyledTextField
      label="Name"
      value={characterData.name}
      onChange={onFieldChange("name")}
      required
      sx={{ maxWidth: 400 }}
    />
    <StyledTextField
      label="Description"
      value={characterData.description}
      onChange={onFieldChange("description")}
      required
      multiline
      minRows={3}
      maxRows={6}
    />
    <StyledTextField
      label="Message Example"
      value={characterData.mes_example}
      onChange={onFieldChange("mes_example")}
      multiline
      minRows={1}
      maxRows={3}
    />
    <StyledTextField
      label="Scenario"
      value={characterData.scenario}
      onChange={onFieldChange("scenario")}
      multiline
      minRows={1}
      maxRows={3}
    />
    <StyledTextField
      label="First Message"
      value={characterData.first_mes}
      onChange={onFieldChange("first_mes")}
      multiline
      minRows={1}
      maxRows={3}
    />
  </Stack>
);
