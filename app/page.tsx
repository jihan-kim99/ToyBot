"use client";
import { useState, useRef, useEffect } from "react";
import { ChatTemplate } from "./components/templates/ChatTemplate";
import { Message } from "./types/chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [charaAppearance, setcharaAppearance] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("scrolling to bottom");
  }, [messages]);

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
    const response = await fetch("/api/generateImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt, charaAppearance }),
    });

    const data = await response.json();
    if (data.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Image: prompt ${data.prompt}`,
          sender: "bot",
          timestamp: new Date(),
          imageUrl: data.imageUrl,
        },
      ]);
      return;
    }
    throw new Error(data.error);
  };

  const handleRestart = () => {
    setMessages([]);
  };

  return (
    <ChatTemplate
      messages={messages}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      generateImage={generateImage}
      systemPrompt={systemPrompt}
      setSystemPrompt={setSystemPrompt}
      charaAppearance={charaAppearance}
      setCharaAppearance={setcharaAppearance}
      handleRestart={handleRestart}
      isLoading={isLoading}
      ref={messagesEndRef}
    />
  );
}
