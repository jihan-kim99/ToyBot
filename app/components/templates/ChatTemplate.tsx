import { Box } from "@mui/material";
import { forwardRef } from "react";
import { Message } from "../../types/chat";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatBody } from "../organisms/ChatBody";
import { ChatForm } from "../organisms/ChatForm";

interface ChatTemplateProps {
  generateImage: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  input: string;
  isLoading: boolean;
  messages: Message[];
  setInput: (value: string) => void;
  setSystemPrompt?: (value: string) => void;
  systemPrompt?: string;
  charaAppearance?: string;
  setCharaAppearance?: (value: string) => void;
}

export const ChatTemplate = forwardRef<HTMLDivElement, ChatTemplateProps>(
  (
    {
      generateImage,
      handleSubmit,
      input,
      isLoading,
      messages,
      setInput,
      setSystemPrompt,
      systemPrompt,
      charaAppearance,
      setCharaAppearance,
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
          charaAppearance={charaAppearance || ""}
          onCharaAppearanceChange={setCharaAppearance}
        />
        <ChatBody messages={messages} isLoading={isLoading} ref={ref} />
        <ChatForm
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onGenerateImage={generateImage}
        />
      </Box>
    );
  }
);

ChatTemplate.displayName = "ChatTemplate";
