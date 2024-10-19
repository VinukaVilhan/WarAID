import React from "react";
import { useChatbot } from "../../Context/ChatbotContext";
import { ShieldPlus } from "lucide-react";

const ChatbotButton = () => {
    const { toggleChatbot } = useChatbot(); // Access the toggle function

    return (
        <button
            onClick={toggleChatbot}
            className="fixed bottom-10 right-10 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 z-10 flex items-center justify-center"
        >
            <ShieldPlus className="h-10 w-10 mr-2" />
            <p className="font-bold">Medical Assistant</p>
        </button>
    );
};

export default ChatbotButton;
