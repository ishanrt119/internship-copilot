"use client";

import { useChat } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";


export default function ChatbotOnboarding() {
  const [inputValue, setInputValue] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }) as any,
    messages: [
      {
        id: "sys-1",
        role: "assistant" as any,
        parts: [{ type: "text", text: "Hi! I'm your Internship Copilot. I'm here to help you find the best internship matches. To get started, what's your current experience level (e.g., Sophomore, Bootcamp grad, Self-taught)?" }],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage({ parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-zinc-950 text-white rounded-xl shadow-2xl overflow-hidden border border-zinc-800">
      <div className="p-4 bg-zinc-900 border-b border-zinc-800">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Internship Copilot
        </h2>
        <p className="text-sm text-zinc-400">Profile Setup Assistant</p>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m: any) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-zinc-800 text-zinc-100 rounded-bl-none"
              }`}
            >
              {m.parts ? m.parts.map((part: any, i: number) => {
                if (part.type === "text") return <p key={i}>{part.text}</p>;
                if (part.type.startsWith("tool-")) {
                  return (
                    <div key={(part as any).toolCallId || i} className="mt-2 text-xs text-green-400 bg-zinc-900 p-2 rounded">
                      <span className="font-semibold">System: </span> 
                      Profile Extracted successfully!
                    </div>
                  );
                }
                return null;
              }) : m.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-800 text-zinc-400 rounded-2xl p-3 rounded-bl-none flex space-x-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Tell me about your experience..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
