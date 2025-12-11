"use client";

import { useState, useRef, useEffect } from "react";
import { useBundleStore } from "@/lib/store/bundle";
import { REGISTRY } from "@/lib/registry";
import { formatProductName } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  Plus,
  CheckCircle2,
  Sparkles,
  Mic,
  Search,
  Cpu,
  Layers,
  Zap,
  ArrowRight,
  Rocket,
  Code2,
  Database,
  Wand2,
  Paperclip,
  Sun,
  Moon,
} from "lucide-react";
import type { RegistryItem } from "@/types/registry";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  items?: RegistryItem[];
  reasoning?: string;
  isLoading?: boolean;
}

const LOADING_STEPS = [
  { icon: Search, text: "Analyzing your requirements...", color: "#00F0FF" },
  { icon: Layers, text: "Searching 400+ agents & skills...", color: "#D97757" },
  { icon: Cpu, text: "Finding the perfect combination...", color: "#4E82EE" },
  { icon: Zap, text: "Optimizing for token savings...", color: "#10A37F" },
];

const EXAMPLE_PROMPTS = [
  {
    icon: Rocket,
    title: "Solana DeFi Bot",
    prompt: "Build me a Solana DeFi trading bot with risk management",
    color: "#00F0FF",
  },
  {
    icon: Code2,
    title: "Next.js Full-Stack",
    prompt: "I need a full-stack Next.js app with authentication",
    color: "#D97757",
  },
  {
    icon: Wand2,
    title: "AI Content Workflow",
    prompt: "Create an AI-powered content generation workflow",
    color: "#4E82EE",
  },
  {
    icon: Database,
    title: "Blockchain Indexer",
    prompt: "Help me set up a blockchain data indexer",
    color: "#10A37F",
  },
];

export default function AIStackBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stackThemePreference, setStackThemePreference] = useState<"dark" | "light">("dark"); // Stack output preference
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addItem, getActiveStack } = useBundleStore();

  const activeStack = getActiveStack();
  const selectedIds = new Set(activeStack?.items.map((i) => i.item.id) || []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Hydration guard - prevent SSR/client mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (mounted) {
      scrollToBottom();
    }
  }, [messages, mounted]);

  // Loading step animation
  useEffect(() => {
    if (showLoadingModal) {
      const interval = setInterval(() => {
        setCurrentLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [showLoadingModal]);

  // Show loading spinner until client is hydrated
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const currentInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowLoadingModal(true);
    setCurrentLoadingStep(0);

    try {
      const response = await fetch("/api/workflow/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput,
          sessionId: localStorage.getItem("sessionId") || "anonymous",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate stack");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: data.reasoning || "Here's your recommended stack:",
        items: data.items,
        reasoning: data.reasoning,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.cached) {
        toast.info("Using cached response", {
          description: "This recommendation was served from cache",
        });
      }
    } catch (error) {
      console.error("Error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Sorry, I encountered an error: ${error.message}`
            : "Sorry, I couldn't generate a stack. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to generate stack");
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleAddItem = (item: RegistryItem) => {
    addItem(item);
    toast.success(`Added ${formatProductName(item.name)} to stack`);
  };

  const handleAddAllItems = (items: RegistryItem[]) => {
    items.forEach((item) => {
      if (!selectedIds.has(item.id)) {
        addItem(item);
      }
    });
    toast.success(`Added ${items.length} items to stack`);
  };

  const showHero = messages.length === 0;
  const textClass = isDarkTheme ? "text-white" : "text-gray-900";
  const mutedTextClass = isDarkTheme ? "text-zinc-400" : "text-gray-600";
  const cardBgClass = isDarkTheme ? "bg-[#0F0F11]" : "bg-white";
  const borderClass = isDarkTheme ? "border-white/[0.08]" : "border-gray-200";

  const mainContent = (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Hero Section */}
      {showHero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center px-6 pb-32"
        >
          {/* OPUS 67 Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDarkTheme ? "bg-[#00F0FF]/10 border-[#00F0FF]/20" : "bg-cyan-100 border-cyan-200"} border mb-8`}
          >
            <div className={`w-5 h-5 rounded-full ${isDarkTheme ? "bg-[#00F0FF]/20" : "bg-cyan-200"} flex items-center justify-center`}>
              <Sparkles className={`w-3 h-3 ${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"}`} />
            </div>
            <span className={`text-sm font-medium ${isDarkTheme ? "text-white/80" : "text-gray-700"}`}>
              Powered by <span className={`${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"} font-bold`}>OPUS 67</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-5xl md:text-7xl font-display font-bold text-center ${textClass} mb-6 tracking-tight`}
          >
            Stack & Ship{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F]">
              with AI
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xl ${mutedTextClass} text-center max-w-2xl mb-8`}
          >
            Describe your app idea. We&apos;ll assemble the perfect AI-powered stack
            and generate production-ready code - no coding required.
          </motion.p>

          {/* Gradient CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => inputRef.current?.focus()}
            className="mb-10 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
          >
            Stack & Build
          </motion.button>

          {/* Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-2xl"
          >
            <form onSubmit={handleSubmit}>
              <div className={`relative rounded-2xl border ${borderClass} ${cardBgClass} shadow-2xl ${isDarkTheme ? "shadow-black/50" : "shadow-gray-200/50"} overflow-hidden`}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Describe your app idea and we'll build it..."
                  rows={1}
                  className={`w-full px-5 py-4 bg-transparent ${textClass} ${isDarkTheme ? "placeholder:text-zinc-500" : "placeholder:text-gray-400"} focus:outline-none resize-none text-lg`}
                  disabled={isLoading}
                  style={{ minHeight: "60px" }}
                />

                {/* Bottom toolbar */}
                <div className={`flex items-center justify-between px-4 py-3 border-t ${isDarkTheme ? "border-white/[0.05]" : "border-gray-100"}`}>
                  {/* Left side - Attachment & Theme Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => toast.info("File attachments coming soon!")}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        isDarkTheme
                          ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                          : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      } transition-all`}
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Stack Theme Toggle (dark/light preference for output) */}
                    <button
                      type="button"
                      onClick={() => setStackThemePreference(stackThemePreference === "dark" ? "light" : "dark")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                        isDarkTheme
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-all`}
                      title={`Stack theme: ${stackThemePreference}`}
                    >
                      {stackThemePreference === "dark" ? (
                        <Moon className={`w-4 h-4 ${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"}`} />
                      ) : (
                        <Sun className={`w-4 h-4 ${isDarkTheme ? "text-yellow-400" : "text-yellow-500"}`} />
                      )}
                      <span className={`text-xs font-medium ${isDarkTheme ? "text-zinc-400" : "text-gray-600"}`}>
                        {stackThemePreference === "dark" ? "Dark" : "Light"}
                      </span>
                    </button>
                  </div>

                  {/* Right side - Voice & Send */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : isDarkTheme
                            ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      } transition-all`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Example Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full">
              {EXAMPLE_PROMPTS.map((example, index) => {
                const Icon = example.icon;
                return (
                  <motion.button
                    key={example.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => {
                      setInput(example.prompt);
                      inputRef.current?.focus();
                    }}
                    className={`group flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      isDarkTheme
                        ? "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${example.color}15`, border: `1px solid ${example.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: example.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${textClass}`}>{example.title}</p>
                      <p className={`text-xs truncate ${mutedTextClass}`}>{example.prompt}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${mutedTextClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chat Interface */}
      {!showHero && (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className={`w-10 h-10 rounded-xl ${isDarkTheme ? "bg-[#00F0FF]/10 border-[#00F0FF]/20" : "bg-cyan-100 border-cyan-200"} border flex items-center justify-center flex-shrink-0`}>
                      <Bot className={`w-5 h-5 ${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"}`} />
                    </div>
                  )}

                  <div className={`max-w-[75%] ${message.role === "user" ? "bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white rounded-2xl rounded-tr-md px-5 py-3" : ""}`}>
                    <p className={message.role === "user" ? "font-medium" : isDarkTheme ? "text-zinc-300" : "text-gray-700"}>
                      {message.content}
                    </p>

                    {message.items && message.items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {/* OPUS 67 - Special highlight card */}
                        {message.items.find(item => item.id === "opus67-base") && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-xl border-2 border-[#00F0FF]/50 bg-gradient-to-r from-[#00F0FF]/10 via-[#00F0FF]/5 to-transparent p-3 mb-3"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 blur-3xl rounded-full -mr-16 -mt-16" />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center">
                                  <Sparkles className="w-5 h-5 text-[#00F0FF]" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-[#00F0FF]">OPUS 67</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] font-medium">BASE</span>
                                  </div>
                                  <p className="text-xs text-zinc-400">141 skills · 82 MCPs · 30 modes</p>
                                </div>
                              </div>
                              {!selectedIds.has("opus67-base") ? (
                                <button
                                  onClick={() => handleAddItem(message.items!.find(i => i.id === "opus67-base")!)}
                                  className="px-3 py-1.5 rounded-lg bg-[#00F0FF]/20 text-[#00F0FF] text-xs font-medium hover:bg-[#00F0FF]/30 transition-colors"
                                >
                                  Add
                                </button>
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-[#00F0FF]" />
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Header with Add All */}
                        <div className="flex items-center justify-between py-1">
                          <p className={`text-xs ${isDarkTheme ? "text-zinc-500" : "text-gray-500"} uppercase tracking-wider`}>
                            Stack ({message.items.length - 1} items)
                          </p>
                          <button
                            onClick={() => handleAddAllItems(message.items!)}
                            className={`text-xs ${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"} hover:underline flex items-center gap-1`}
                          >
                            <Plus className="w-3 h-3" />
                            Add All
                          </button>
                        </div>

                        {/* Compact grid for other items */}
                        <div className="flex flex-wrap gap-1.5">
                          {message.items.filter(item => item.id !== "opus67-base").map((item) => {
                            const isInStack = selectedIds.has(item.id);
                            const kindColor = item.kind === "agent" ? "#D97757" : item.kind === "skill" ? "#4E82EE" : item.kind === "mcp" ? "#10A37F" : "#888";
                            return (
                              <motion.button
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => !isInStack && handleAddItem(item)}
                                disabled={isInStack}
                                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                  isInStack
                                    ? "bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]"
                                    : isDarkTheme
                                      ? "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-zinc-300"
                                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: kindColor }}
                                />
                                <span className="font-medium truncate max-w-[120px]">{formatProductName(item.name)}</span>
                                {isInStack ? (
                                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                ) : (
                                  <Plus className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Bottom */}
          <div className="pt-4">
            <form onSubmit={handleSubmit}>
              <div className={`relative rounded-2xl border ${borderClass} ${cardBgClass}`}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Continue building..."
                  rows={1}
                  className={`w-full px-5 py-4 bg-transparent ${textClass} ${isDarkTheme ? "placeholder:text-zinc-500" : "placeholder:text-gray-400"} focus:outline-none resize-none`}
                  disabled={isLoading}
                />
                <div className={`flex items-center justify-between px-4 py-3 border-t ${isDarkTheme ? "border-white/[0.05]" : "border-gray-100"}`}>
                  {/* Left side - Attachment & Theme Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toast.info("File attachments coming soon!")}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${isDarkTheme ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"} transition-all`}
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStackThemePreference(stackThemePreference === "dark" ? "light" : "dark")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDarkTheme ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"} transition-all`}
                      title={`Stack theme: ${stackThemePreference}`}
                    >
                      {stackThemePreference === "dark" ? (
                        <Moon className={`w-4 h-4 ${isDarkTheme ? "text-[#00F0FF]" : "text-cyan-600"}`} />
                      ) : (
                        <Sun className={`w-4 h-4 ${isDarkTheme ? "text-yellow-400" : "text-yellow-500"}`} />
                      )}
                      <span className={`text-xs font-medium ${isDarkTheme ? "text-zinc-400" : "text-gray-600"}`}>
                        {stackThemePreference === "dark" ? "Dark" : "Light"}
                      </span>
                    </button>
                  </div>
                  {/* Right side - Voice & Send */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${isListening ? "bg-red-500 text-white animate-pulse" : isDarkTheme ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"} transition-all`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkTheme ? "" : "bg-gray-50"}`}>
      {isDarkTheme ? (
        <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white">{mainContent}</AuroraBackground>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">{mainContent}</div>
      )}

      {/* Loading Modal */}
      <AnimatePresence>
        {showLoadingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md mx-4"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0F0F11]/90 backdrop-blur-xl p-8">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] opacity-20 animate-pulse" />
                <div className="absolute inset-[1px] rounded-3xl bg-[#0F0F11]" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <motion.div
                      key={currentLoadingStep}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${LOADING_STEPS[currentLoadingStep].color}15`,
                        border: `2px solid ${LOADING_STEPS[currentLoadingStep].color}40`,
                      }}
                    >
                      {(() => {
                        const Icon = LOADING_STEPS[currentLoadingStep].icon;
                        return <Icon className="w-10 h-10" style={{ color: LOADING_STEPS[currentLoadingStep].color }} />;
                      })()}
                    </motion.div>
                  </div>

                  <motion.div key={`text-${currentLoadingStep}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <p className="text-xl font-bold mb-2" style={{ color: LOADING_STEPS[currentLoadingStep].color }}>
                      {LOADING_STEPS[currentLoadingStep].text}
                    </p>
                    <p className="text-sm text-zinc-500">Building the perfect stack for you...</p>
                  </motion.div>

                  <div className="flex justify-center gap-2 mb-6">
                    {LOADING_STEPS.map((step, index) => (
                      <motion.div
                        key={index}
                        className="w-2 h-2 rounded-full"
                        animate={{
                          backgroundColor: index === currentLoadingStep ? step.color : "rgba(255,255,255,0.2)",
                          scale: index === currentLoadingStep ? 1.3 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>

                  <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F]"
                      animate={{ x: ["0%", "200%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
