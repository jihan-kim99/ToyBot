export interface CharacterData {
  name?: string;
  description?: string;
  personality?: string;
  mes_example?: string;
  scenario?: string;
  first_mes?: string;
  data?: CharacterData;
}
