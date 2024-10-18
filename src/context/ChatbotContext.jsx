import React, { createContext, useState, useContext } from "react";

// Create the context
const ChatbotContext = createContext();

// Custom hook for using the chatbot context
export const useChatbot = () => useContext(ChatbotContext);

// Provider component to wrap your app
export const ChatbotProvider = ({ children }) => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const toggleChatbot = () => {
        setIsChatbotOpen((prev) => !prev);
    };

    return (
        <ChatbotContext.Provider value={{ isChatbotOpen, toggleChatbot }}>
            {children}
        </ChatbotContext.Provider>
    );
};
