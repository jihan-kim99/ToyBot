import { Box } from "@mui/material";
import { forwardRef } from "react";
import { Message } from "../../types/chat";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatBody } from "../organisms/ChatBody";
import { ChatForm } from "../organisms/ChatForm";

interface ChatTemplateProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  systemPrompt?: string;
  setSystemPrompt?: (value: string) => void;
  isLoading: boolean;
}

export const ChatTemplate = forwardRef<HTMLDivElement, ChatTemplateProps>(
  (
    {
      messages,
      input,
      setInput,
      handleSubmit,
      systemPrompt,
      setSystemPrompt,
      isLoading,
    },
    ref
  ) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };

    return (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ChatHeader
          systemPrompt={systemPrompt || ""}
          onSystemPromptChange={setSystemPrompt}
        />
        <ChatBody messages={messages} isLoading={isLoading} ref={ref} />
        <ChatForm
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </Box>
    );
  }
);

ChatTemplate.displayName = "ChatTemplate";
