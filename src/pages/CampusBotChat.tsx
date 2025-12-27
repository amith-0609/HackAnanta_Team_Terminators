import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  BookOpen,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isError?: boolean;
}

const suggestedQuestions = [
  { icon: Briefcase, text: "What internships match my profile?" },
  { icon: BookOpen, text: "How should I prepare for coding interviews?" },
  { icon: Lightbulb, text: "What skills should I focus on learning?" },
];

const initialMessages: Message[] = [
  {
    id: 1,
    content: "Hey! 👋 I'm CampusBot, your AI campus assistant. I can help you find internships, prepare for interviews, discover resources, and more. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

export default function CampusBotChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const botResponse = data.reply;

      const botMessage: Message = {
        id: Date.now(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMessage = "Sorry, I'm having trouble connecting right now.";

      if (error.message) {
        errorMessage += `\nError details: ${error.message}`;
      }

      const errorMsg: Message = {
        id: Date.now(),
        content: errorMessage,
        sender: "bot",
        timestamp: new Date(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            CampusBot
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-sm text-muted-foreground">Your AI campus assistant (Powered by OpenRouter)</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="status-indicator bg-success" />
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-card">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.sender === "bot" ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isError ? "bg-destructive" : "bg-gradient-primary"}`}>
                  {message.isError ? <AlertCircle className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
              ) : (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 ${message.sender === "user"
                  ? "chat-bubble-user"
                  : message.isError
                    ? "bg-destructive/10 text-destructive rounded-2xl rounded-tl-none border border-destructive/20"
                    : "chat-bubble-bot"
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-bot px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse animation-delay-200" />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse animation-delay-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question.text)}
                >
                  <question.icon className="w-3 h-3 mr-1" />
                  {question.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <Input
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
