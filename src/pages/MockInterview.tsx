import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Mic, PlayCircle, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/services/jobsApi";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function MockInterview() {
    const { toast } = useToast();
    const [step, setStep] = useState<'setup' | 'interview'>('setup');

    // Setup State
    const [role, setRole] = useState("Frontend Developer");
    const [topic, setTopic] = useState("React & JavaScript");
    const [difficulty, setDifficulty] = useState("Medium");
    const [isStarting, setIsStarting] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const startInterview = async () => {
        setIsStarting(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/interview/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, topic, difficulty })
            });

            const data = await response.json();

            if (data.message) {
                setMessages([
                    {
                        id: '1',
                        text: data.message,
                        sender: 'ai',
                        timestamp: new Date()
                    }
                ]);
                setStep('interview');
            }
        } catch (error) {
            toast({
                title: "Error Starting Interview",
                description: "Could not connect to the AI interviewer. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/interview/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages.map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            const data = await response.json();

            if (data.message) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            toast({
                title: "Connection Error",
                description: "Failed to send message.",
                variant: "destructive"
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-fade-in">
            {step === 'setup' ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card className="w-full max-w-md shadow-lg border-primary/20">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">AI Mock Interviewer</CardTitle>
                            <p className="text-muted-foreground">Practice technical interviews with real-time feedback</p>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Role</label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                                        <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                                        <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                                        <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                                        <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Topic / Skill</label>
                                <Input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. React, Python, System Design"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty</label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy (Intern)</SelectItem>
                                        <SelectItem value="Medium">Medium (Junior)</SelectItem>
                                        <SelectItem value="Hard">Hard (Senior)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full mt-4 bg-gradient-primary"
                                size="lg"
                                onClick={startInterview}
                                disabled={isStarting}
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Initializing AI...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Start Interview
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{role} Interview</h2>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">{topic}</Badge>
                                    <Badge variant="outline" className="text-xs">{difficulty}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setStep('setup')}>
                            <StopCircle className="w-4 h-4 mr-2" />
                            End Session
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-border/50">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-card border border-border rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <span className="text-[10px] opacity-70 mt-1 block text-right">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-card border-t border-border">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type your answer..."
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button onClick={sendMessage} disabled={!input.trim() || isTyping}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
