import { Paper, Typography, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "prismjs/themes/prism.css";

interface ChatBubbleProps {
  text: string;
  timestamp: Date;
  isUser: boolean;
  imageUrl?: string;
  onImageClick: (url: string) => (event: React.MouseEvent) => void;
}

export const ChatBubble = ({
  text,
  timestamp,
  isUser,
  imageUrl,
  onImageClick,
}: ChatBubbleProps) => (
  <Paper
    sx={{
      maxWidth: imageUrl ? 400 : "70%", // Set max width for image bubbles
      p: imageUrl ? 0 : 2,
      bgcolor: isUser ? "#dcf8c6" : "#fff",
      borderRadius: 2,
      ml: isUser ? "auto" : 0,
      overflow: "hidden",
      "& pre": {
        background: "#f6f8fa",
        padding: 1,
        borderRadius: 1,
        overflowX: "auto",
      },
      "& code": {
        fontFamily: "monospace",
      },
      "& p": {
        margin: 0,
      },
      "& a": {
        color: "#0366d6",
      },
    }}
  >
    {imageUrl ? (
      <>
        <Box
          component="img"
          src={imageUrl}
          alt="Generated image"
          onClick={onImageClick(imageUrl)}
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "auto",
            display: "block",
            cursor: "pointer",
          }}
        />
        <Box sx={{ p: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "right",
              color: "text.secondary",
            }}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      </>
    ) : (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <Typography variant="body1" color="text.primary">
              {children}
            </Typography>
          ),
          em: ({ children }) => (
            <Typography
              component="span"
              sx={{ color: "#2196f3", fontStyle: "italic" }}
            >
              {children}
            </Typography>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    )}
  </Paper>
);
