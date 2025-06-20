"use client";

import { useState, useEffect } from "react";
import { generateImage } from "@/utils/generateImage";
import { SchedulerType, getSchedulerTypes } from "@/utils/schedulerTypes";
import { useImageViewer } from "react-image-viewer-hook";
import { styled } from "@mui/material/styles";
import {
  Box,
  Container,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  CircularProgress,
  Drawer,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseButton from "@mui/icons-material/Close";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  height: "100%",
}));

const defaultParams = {
  prompt: "",
  negative_prompt: "",
  height: 1440,
  width: 960,
  num_inference_steps: 30,
  guidance_scale: 6,
  scheduler: SchedulerType.DPMSolverMultistepKarras,
};

export default function GeneratePage() {
  const [params, setParams] = useState(defaultParams);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState<
    Array<{
      prompt: string;
      negative_prompt: string;
      imageUrl: string;
      id?: string;
    }>
  >([]);
  const [isGalleryView, setIsGalleryView] = useState(false);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("promptHistory");
    if (savedHistory) {
      setPromptHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Update localStorage when history changes
  const updateHistory = (
    newHistory: Array<{
      prompt: string;
      negative_prompt: string;
      imageUrl: string;
      id?: string;
    }>
  ) => {
    setPromptHistory(newHistory);
    localStorage.setItem("promptHistory", JSON.stringify(newHistory));
  };

  const handleSwap = () => {
    setParams((prev) => ({
      ...prev,
      height: prev.width,
      width: prev.height,
    }));
  };

  const processImageForStorage = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/processImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      return data.processedImage;
    } catch (error) {
      console.error("Error processing image:", error);
      return imageUrl; // fallback to original image if processing fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = await generateImage(params);
    setImageUrl(url);

    // Process image before saving to history
    const processedUrl = await processImageForStorage(url);

    // Add current prompts and processed image to history with unique id
    const newItem = {
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
      imageUrl: processedUrl,
      id: Date.now().toString(),
    };
    updateHistory([newItem, ...promptHistory]);
    setLoading(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const { getOnClick, ImageViewer } = useImageViewer();

  const handleHistorySelect = (item: {
    prompt: string;
    negative_prompt: string;
    imageUrl: string;
  }) => {
    setParams((prev) => ({
      ...prev,
      prompt: item.prompt,
      negative_prompt: item.negative_prompt,
    }));
    setImageUrl(item.imageUrl);
    setHistoryOpen(false);
  };

  const handleWeightAdjustment = (
    e: React.KeyboardEvent<HTMLDivElement>,
    field: "prompt" | "negative_prompt"
  ) => {
    if (e.ctrlKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const cursorPos = target.selectionStart;
      const text = params[field];

      // Find if cursor is within a weighted text pattern
      const weightRegex = /\((.*?):([\d.]+)\)/g;
      let match;
      while ((match = weightRegex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        // Check if cursor is within this weighted text
        if (cursorPos >= startIndex && cursorPos <= endIndex) {
          const beforeWeight = text.substring(0, startIndex);
          const afterWeight = text.substring(endIndex);
          const content = match[1];
          const currentWeight = parseFloat(match[2]);

          // Adjust weight
          const newWeight =
            e.key === "ArrowUp"
              ? Math.min(currentWeight + 0.1, 2).toFixed(1)
              : Math.max(currentWeight - 0.1, 0.1).toFixed(1);

          const newText = `${beforeWeight}(${content}:${newWeight})${afterWeight}`;
          setParams((prev) => ({ ...prev, [field]: newText }));

          // Preserve cursor position
          setTimeout(() => {
            const newCursorPos =
              startIndex + `(${content}:${newWeight})`.length;
            target.selectionStart = newCursorPos;
            target.selectionEnd = newCursorPos;
          }, 0);
          return;
        }
      }

      // Handle selected text case (existing functionality)
      if (target.selectionStart !== target.selectionEnd) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const selectedText = text.substring(start, end);

        // ... rest of the existing selected text handling code ...
        const match = selectedText.match(/\((.*?):([\d.]+)\)/);

        let newText;
        if (match) {
          const currentWeight = parseFloat(match[2]);
          const newWeight =
            e.key === "ArrowUp"
              ? Math.min(currentWeight + 0.1, 2).toFixed(1)
              : Math.max(currentWeight - 0.1, 0.1).toFixed(1);
          newText = `(${match[1]}:${newWeight})`;
        } else {
          const weight = e.key === "ArrowUp" ? "1.1" : "0.9";
          newText = `(${selectedText}:${weight})`;
        }

        const updatedText =
          text.substring(0, start) + newText + text.substring(end);
        setParams((prev) => ({ ...prev, [field]: updatedText }));

        setTimeout(() => {
          target.selectionStart = start;
          target.selectionEnd = start + newText.length;
        }, 0);
      }
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const newHistory = promptHistory.filter((item) => item.id !== id);
    updateHistory(newHistory);
  };

  // Base prompt constants
  const BASE_PROMPT =
    "masterpiece, best quality, amazing quality, very aesthetic, high resolution, ultra-detailed, absurdres, newest, scenery";
  const BASE_NEGATIVE_PROMPT =
    "modern, recent, old, oldest, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured, long body, lowres, bad anatomy, bad hands, missing fingers, extra digits, fewer digits, cropped, very displeasing, (worst quality, bad quality:1.2), bad anatomy, sketch, jpeg artifacts, signature, watermark, username, signature, simple background, conjoined, bad ai-generated";

  const handleAddBasePrompt = () => {
    setParams((prev) => ({
      ...prev,
      prompt: prev.prompt ? `${BASE_PROMPT}, ${prev.prompt}` : BASE_PROMPT,
      negative_prompt: prev.negative_prompt
        ? `${BASE_NEGATIVE_PROMPT}, ${prev.negative_prompt}`
        : BASE_NEGATIVE_PROMPT,
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Item elevation={3}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                ImGen
              </Typography>
              <Button variant="outlined" href="/" sx={{ mr: 2 }}>
                back
              </Button>
              <Button variant="outlined" onClick={() => setHistoryOpen(true)}>
                hist
              </Button>
            </Box>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Prompt"
                    multiline
                    rows={4}
                    value={params.prompt}
                    onChange={(e) =>
                      setParams({ ...params, prompt: e.target.value })
                    }
                    onKeyDown={(e) => handleWeightAdjustment(e, "prompt")}
                  />
                </Grid>
                <Grid
                  size={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Button variant="outlined" onClick={handleAddBasePrompt}>
                    Base
                  </Button>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Negative Prompt"
                    multiline
                    rows={4}
                    value={params.negative_prompt}
                    onChange={(e) =>
                      setParams({ ...params, negative_prompt: e.target.value })
                    }
                    onKeyDown={(e) =>
                      handleWeightAdjustment(e, "negative_prompt")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 10, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Width"
                    value={params.width}
                    onChange={(e) =>
                      setParams({ ...params, width: parseInt(e.target.value) })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 1,
                      minWidth: "32px",
                      width: "32px",
                      height: "32px",
                      p: 0.5,
                    }}
                    onClick={handleSwap}
                  >
                    <SwapVertIcon fontSize="small" sx={{ fontSize: "16px" }} />
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Height"
                    value={params.height}
                    onChange={(e) =>
                      setParams({ ...params, height: parseInt(e.target.value) })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Steps"
                    value={params.num_inference_steps}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        num_inference_steps: parseInt(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Guidance Scale"
                    inputProps={{ step: 0.1 }}
                    value={params.guidance_scale}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        guidance_scale: parseFloat(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    select
                    label="Scheduler"
                    value={params.scheduler}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        scheduler: e.target.value as SchedulerType,
                      })
                    }
                  >
                    {getSchedulerTypes().map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ height: 56 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Item>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Item
            elevation={3}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: imageUrl ? "background.paper" : "grey.100",
              minHeight: { xs: "300px", md: "600px" },
            }}
          >
            {imageUrl ? (
              <>
                <Box
                  component="img"
                  src={imageUrl}
                  alt="Generated"
                  onClick={getOnClick(imageUrl)}
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxWidth: "100%",
                    display: "block",
                    cursor: "pointer",
                    borderRadius: 1,
                  }}
                />
                <ImageViewer />
              </>
            ) : (
              <Typography variant="h6" color="text.secondary">
                Generated image will appear here
              </Typography>
            )}
          </Item>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "400px" },
            overflowY: "auto",
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">History</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsGalleryView(!isGalleryView)}
              >
                {isGalleryView ? "Hist" : "Gall"}
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  setHistoryOpen(false);
                }}
                sx={{ ml: 1 }}
              >
                <CloseButton fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {isGalleryView ? (
            <>
              <Grid container spacing={1}>
                {promptHistory.map((item, index) => (
                  <Grid key={item.id ?? index} size={6}>
                    <Card
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scale(1.02)",
                          transition: "transform 0.2s",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={item.imageUrl}
                        alt={item.prompt}
                        sx={{ objectFit: "cover" }}
                        onClick={getOnClick(item.imageUrl)}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          right: 4,
                          top: 4,
                          bgcolor: "rgba(255, 255, 255, 0.7)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(item.id!);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <ImageViewer />
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {promptHistory.map((item, index) => (
                <Card
                  key={item.id ?? index}
                  sx={{ cursor: "pointer", position: "relative" }}
                >
                  <CardMedia
                    component="img"
                    height="100%"
                    image={item.imageUrl}
                    alt={item.prompt}
                    sx={{ objectFit: "cover" }}
                    onClick={() => handleHistorySelect(item)}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHistoryItem(item.id!);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Prompt:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {item.prompt}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Negative Prompt:
                    </Typography>
                    <Typography variant="body2">
                      {item.negative_prompt.length > 100
                        ? item.negative_prompt.substring(0, 100) + "..."
                        : item.negative_prompt}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Drawer>
    </Container>
  );
}
