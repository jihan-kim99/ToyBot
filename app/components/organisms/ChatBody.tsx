import { Box, CircularProgress } from "@mui/material";
import { forwardRef } from "react";
import { ChatBubble } from "../atoms/ChatBubble";
import { Message } from "../../types/chat";

interface ChatBodyProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatBody = forwardRef<HTMLDivElement, ChatBodyProps>(
  ({ messages, isLoading }, ref) => (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        overflow: "auto",
        p: 2,
        bgcolor: "#e5ded8",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          text={message.text}
          timestamp={message.timestamp}
          isUser={message.sender === "user"}
        />
      ))}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  )
);

ChatBody.displayName = "ChatBody";
