"use client";
import { useState, useRef, useEffect } from "react";
import debounce from "lodash/debounce";
import { ChatTemplate } from "../components/templates/ChatTemplate";
import { CharacterSetting } from "../components/templates/CharacterSetting";
import type { GenerateImageResponse } from "@/types/api";
import {
  initDB,
  saveChatHistory,
  getCharacterChatHistories,
  ChatHistory,
} from "@/utils/indexedDB";

import { Message } from "@/types/chat";
import type { CharacterData } from "@/types/character";

// Create debounced function outside component
const createDebouncedSave = () =>
  debounce(
    (chatHistory: {
      id: string;
      characterId: string;
      characterName: string;
      messages: Message[];
      lastUpdated: Date;
    }) => {
      saveChatHistory(chatHistory).catch((error) => {
        console.error("Failed to save chat history:", error);
      });
    },
    1000
  );

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<CharacterData>({
    name: "",
    description: "",
    personality: "",
    mes_example: "",
    scenario: "",
    first_mes: "",
  });
  const [charaAppearance, setcharaAppearance] = useState<string>("");
  const [charaImage, setCharaImage] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize DB with error handling
  useEffect(() => {
    initDB().catch((error) => {
      console.error("Failed to initialize database:", error);
      // Optionally show an error message to the user
    });
  }, []);

  useEffect(() => {
    if (systemPrompt.name && !chatId) {
      const newChatId = `${systemPrompt.name}-${Date.now()}`;
      setChatId(newChatId);
    }
  }, [systemPrompt.name, chatId]);

  // Add this new effect to load chat histories when character is selected
  useEffect(() => {
    if (systemPrompt.name) {
      getCharacterChatHistories(systemPrompt.name)
        .then((histories) => {
          setChatHistories(
            histories.sort(
              (a, b) =>
                new Date(b.lastUpdated).getTime() -
                new Date(a.lastUpdated).getTime()
            )
          );
        })
        .catch((error) => {
          console.error("Failed to load chat histories:", error);
        });
    }
  }, [systemPrompt.name]);

  // Memoize the debounced function
  const debouncedSave = useRef(createDebouncedSave());

  // Update the save effect with proper cleanup
  useEffect(() => {
    if (chatId && messages.length > 0) {
      debouncedSave.current({
        id: chatId,
        characterId: systemPrompt.name || "",
        characterName: systemPrompt.name || "", // Add this line
        messages,
        lastUpdated: new Date(),
      });
    }

    return () => {
      debouncedSave.current.cancel();
    };
  }, [messages, chatId, systemPrompt.name]);

  const sendMessageToBot = async (
    text: string,
    conversationHistory: Message[]
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: conversationHistory.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          systemPrompt: systemPrompt,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.response;
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, I encountered an error. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const botResponse = await sendMessageToBot(input, messages);
    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const generateImage = async () => {
    setIsLoading(true);
    const shrunkMessages = messages.slice(-5);
    try {
      // Initial request to start image generation
      const response = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: shrunkMessages,
          systemPrompt,
          charaAppearance,
        }),
      });

      const data: GenerateImageResponse = await response.json();
      if (!data.success || !data.jobId)
        throw new Error(data.error || "Failed to start image generation");

      const jobId = data.jobId;
      const imageTags = data.imageTags;

      // Start polling
      while (true) {
        const statusResponse = await fetch("/api/generateImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });

        const statusData: GenerateImageResponse = await statusResponse.json();

        if (statusData.status === "COMPLETED" && statusData.imageUrl) {
          // Check if the image URL already exists in messages
          const imageExists = messages.some(
            (msg) => msg.imageUrl === statusData.imageUrl
          );

          if (!imageExists) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                text: `Image: prompt ${imageTags}`,
                sender: "bot",
                timestamp: new Date(),
                imageUrl: statusData.imageUrl,
              },
            ]);
          }
          break;
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.error || "Image generation failed");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    const newChatId = `${systemPrompt.name}-${Date.now()}`;
    setChatId(newChatId);
  };

  if (systemPrompt.name === "") {
    return (
      <CharacterSetting
        charaImage={charaImage}
        setCharaImage={setCharaImage}
        setMessages={setMessages}
        charaAppearance={charaAppearance}
        setCharaAppearance={setcharaAppearance}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />
    );
  }

  return (
    <ChatTemplate
      chatHistories={chatHistories} // Add this prop
      charaAppearance={charaAppearance}
      charaImage={charaImage}
      generateImage={generateImage}
      handleRestart={handleRestart}
      handleSubmit={handleSubmit}
      input={input}
      isLoading={isLoading}
      messages={messages}
      ref={messagesEndRef}
      setCharaAppearance={setcharaAppearance}
      setCharaImage={setCharaImage}
      setInput={setInput}
      setMessages={setMessages}
      setSystemPrompt={setSystemPrompt}
      systemPrompt={systemPrompt}
    />
  );
}
