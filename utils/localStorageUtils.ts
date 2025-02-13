import { CharacterData } from "@/types/character";

const STORAGE_KEY = "saved_characters";

export interface SavedCharacter {
  id: string;
  name: string;
  data: CharacterData;
  savedAt: string;
  imageUrl?: string;
}

const compressImage = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch('/api/processImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Image processing failed');
    }

    const data = await response.json();
    return data.processedImage;
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageUrl; // Return original image if compression fails
  }
};

export const saveCharacterToStorage = async (
  character: CharacterData,
  imageUrl?: string
) => {
  try {
    const savedCharacters = getSavedCharacters();
    const compressedImage = imageUrl ? await compressImage(imageUrl) : undefined;

    const newCharacter: SavedCharacter = {
      id: Date.now().toString(),
      name: character.name || "Unnamed Character",
      data: character,
      savedAt: new Date().toISOString(),
      imageUrl: compressedImage,
    };

    const updatedCharacters = [...savedCharacters, newCharacter];
    
    // Try to save with compressed image
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharacters));
      return updatedCharacters;
    } catch (e) {
      if (e instanceof Error && e.name === "QuotaExceededError") {
        // If quota exceeded, remove oldest character and try again
        if (savedCharacters.length > 0) {
          const reducedCharacters = [...savedCharacters.slice(1), newCharacter];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedCharacters));
          return reducedCharacters;
        }
      }
      throw e;
    }
  } catch (error) {
    console.error("Error saving character:", error);
    return null;
  }
};

export const getSavedCharacters = (): SavedCharacter[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const deleteCharacter = (id: string) => {
  try {
    const savedCharacters = getSavedCharacters();
    const updatedCharacters = savedCharacters.filter((char) => char.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharacters));
    return updatedCharacters;
  } catch (error) {
    console.error("Error deleting character:", error);
    return null;
  }
};
