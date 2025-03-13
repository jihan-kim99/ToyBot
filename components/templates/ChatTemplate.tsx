import { Box } from "@mui/material";
import { Dispatch, forwardRef, SetStateAction } from "react";
import { Message } from "../../types/chat";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatBody } from "../organisms/ChatBody";
import { ChatFooter } from "../organisms/ChatFooter";
import { CharacterData } from "@/types/character";
import { ChatHistory } from "@/utils/indexedDB";

interface ChatTemplateProps {
  charaAppearance?: string;
  charaImage: string;
  generateImage: () => void;
  handleRestart: () => void;
  handleSubmit: () => void;
  input: string;
  isLoading: boolean;
  messages: Message[];
  setCharaAppearance?: (value: string) => void;
  setCharaImage: (value: string) => void;
  setInput: (value: string) => void;
  setMessages: (value: Message[]) => void;
  setSystemPrompt: Dispatch<SetStateAction<CharacterData>>;
  systemPrompt: CharacterData;
  chatHistories: ChatHistory[];
}

export const ChatTemplate = forwardRef<HTMLDivElement, ChatTemplateProps>(
  (
    {
      charaAppearance,
      charaImage,
      generateImage,
      handleRestart,
      handleSubmit,
      input,
      isLoading,
      messages,
      setCharaAppearance,
      setCharaImage,
      setInput,
      setMessages,
      setSystemPrompt,
      systemPrompt,
    },
    ref
  ) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };

    return (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ChatHeader
          charaImage={charaImage}
          setCharaImage={setCharaImage}
          setMessages={setMessages}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          charaAppearance={charaAppearance || ""}
          onCharaAppearanceChange={setCharaAppearance}
          handleRestart={handleRestart}
        />
        <ChatBody messages={messages} isLoading={isLoading} ref={ref} />
        <ChatFooter
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
