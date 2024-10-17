import React from "react";
import { useState, useEffect, useRef } from "react";
import { Send, ShieldPlus, User, Loader2, X } from "lucide-react";
import { useChatbot } from "../Context/ChatbotContext";

function Chatbot() {
    const { isChatbotOpen, toggleChatbot } = useChatbot();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length === 0) {
            const initialMessage = {
                role: "assistant",
                content: "How can I help you to get medical information?",
            };
            setMessages([initialMessage]);
        }
    }, [messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        try {
            const response = await fetch("/chatbot/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Origin: "http://localhost:5173",
                },
                body: JSON.stringify({ content: input }),
                credentials: "omit",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.choices[0].message.content },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Sorry, there was an error processing your request: ${error.message}`,
                },
            ]);
        } finally {
            setIsLoading(false);
            setInput("");
        }
    };

    if (!isChatbotOpen) {
        return null;
    }

    const formatMessage = (content) => {
        const parts = content.split(":");
        if (parts.length > 1) {
            const title = parts[0].trim();
            const body = parts.slice(1).join(":").trim();

            return (
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{title}:</h3>
                    {formatBody(body)}
                </div>
            );
        }
        return formatBody(content);
    };

    const formatBody = (text) => {
        const paragraphs = text.split("\n\n").filter((p) => p.trim());
        return (
            <div className="space-y-4">
                {paragraphs.map((paragraph, index) => {
                    if (paragraph.match(/^\d+\./m)) {
                        const steps = paragraph
                            .split(/(?=\d+\.)/)
                            .filter((step) => step.trim())
                            .map((step) => {
                                const [number, ...textParts] = step
                                    .trim()
                                    .split(" ");
                                return {
                                    number: number.replace(".", ""),
                                    text: textParts.join(" "),
                                };
                            });

                        return (
                            <div key={index} className="space-y-2">
                                {steps.map((step, stepIndex) => (
                                    <div
                                        key={stepIndex}
                                        className="flex items-start space-x-3"
                                    >
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                            {step.number}
                                        </span>
                                        <p className="flex-1 text-gray-700">
                                            {step.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        );
                    } else {
                        return (
                            <p key={index} className="text-gray-700">
                                {paragraph}
                            </p>
                        );
                    }
                })}
            </div>
        );
    };

    return (
        <div className="fixed bottom-5 right-5 w-[500px] h-[600px] bg-white rounded-lg shadow-lg overflow-hidden z-50 flex flex-col">
            <div className="bg-blue-600 px-4 py-2 flex justify-between items-center">
                <h1 className="text-lg text-white font-semibold">Medical Assistant</h1>
                <button 
                    onClick={toggleChatbot}
                    className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors duration-200"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`flex items-start max-w-[85%] ${
                                    message.role === "user"
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                }`}
                            >
                                <div
                                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                        message.role === "user"
                                            ? "ml-2 bg-blue-600"
                                            : "mr-2 bg-blue-500"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="h-5 w-5 text-white" />
                                    ) : (
                                        <ShieldPlus className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`px-4 py-3 rounded-lg ${
                                        message.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white shadow-md rounded-bl-none"
                                    }`}
                                >
                                    {message.role === "assistant" ? (
                                        formatMessage(message.content)
                                    ) : (
                                        <p>{message.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                                    <ShieldPlus className="h-5 w-5 text-white" />
                                </div>
                                <div className="bg-white shadow-md rounded-lg rounded-bl-none px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                        <span className="text-gray-500">
                                            Thinking...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-2 bg-white">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <div className="flex items-center">
                                <span className="mr-2">Send</span>
                                <Send className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chatbot;