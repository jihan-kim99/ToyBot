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
      {messages.map((message, index) => (
        <Box
          key={message.id}
          ref={index === messages.length - 1 ? ref : undefined}
        >
          <ChatBubble
            text={message.text}
            timestamp={message.timestamp}
            isUser={message.sender === "user"}
            imageUrl={message?.imageUrl}
          />
        </Box>
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
