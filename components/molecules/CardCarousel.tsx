import { Box, IconButton, Card, CardContent, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Delete } from "@mui/icons-material";
import { SavedCharacter } from "@/utils/localStorageUtils";
import Image from "next/image";
import { whatsappTheme } from "@/theme/whatsapp";
import { useState, useRef } from "react";

interface CardCarouselProps {
  characters: SavedCharacter[];
  onSelect: (character: SavedCharacter) => void;
  onDelete: (id: string) => void;
}

export const CardCarousel = ({
  characters,
  onSelect,
  onDelete,
}: CardCarouselProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardWidth = container.offsetWidth / 3; // Show 3 cards at a time
    const newPosition =
      direction === "left"
        ? Math.max(scrollPosition - cardWidth, 0)
        : Math.min(
            scrollPosition + cardWidth,
            container.scrollWidth - container.offsetWidth
          );

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  return (
    <Box sx={{ position: "relative", mb: 3 }}>
      <IconButton
        onClick={() => scrollTo("left")}
        sx={{
          position: "absolute",
          left: -20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: whatsappTheme.lightGreen,
          "&:hover": { bgcolor: whatsappTheme.primary },
        }}
      >
        <ChevronLeft />
      </IconButton>

      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "hidden",
          scrollBehavior: "smooth",
          p: 1,
        }}
      >
        {characters.map((character) => (
          <Card
            key={character.id}
            sx={{
              minWidth: "200px",
              flex: "0 0 auto",
              cursor: "pointer",
              "&:hover": { transform: "scale(1.02)" },
              transition: "transform 0.2s ease",
              position: "relative",
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(character.id);
              }}
              sx={{
                position: "absolute",
                right: 5,
                top: 5,
                zIndex: 2,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
              }}
            >
              <Delete />
            </IconButton>
            <Box onClick={() => onSelect(character)}>
              {character.imageUrl && (
                <Box sx={{ position: "relative", height: 150 }}>
                  <Image
                    src={character.imageUrl}
                    alt={character.data.name || "Character"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              )}
              <CardContent>
                <Typography variant="h6">{character.data.name}</Typography>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>

      <IconButton
        onClick={() => scrollTo("right")}
        sx={{
          position: "absolute",
          right: -20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: whatsappTheme.lightGreen,
          "&:hover": { bgcolor: whatsappTheme.primary },
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};
