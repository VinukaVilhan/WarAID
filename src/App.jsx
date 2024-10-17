import React from "react";
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import AppRouter from "./router"; // Router component
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ChatbotProvider } from "./Context/ChatbotContext"; // Import the Chatbot context provider
import Chatbot from "./components/ChatBot"; // Import the Chatbot component
import ChatbotButton from "./components/ui/ChatBotButton"; // Import the button to open the chatbot

const authConfig = {
    signInRedirectURL: "http://localhost:5173/",
    signOutRedirectURL: "http://localhost:5173/",
    clientID: "h14EPNFXyNu73kfxGTk_bEcgjfUa",
    baseUrl: "https://api.asgardeo.io/t/dana",
    scope: [
        "openid",
        "profile",
        "address",
        "email",
        "groups",
        "phone",
        "roles",
    ],
};

const App = () => {
    const authContext = useAuthContext();
    const { state } = authContext || { state: {} };

    return (
        <AuthProvider config={authConfig}>
            <ChatbotProvider>
                <Router>
                    <AppRouter />
                        <Chatbot />
                    <ChatbotButton />
                </Router>
            </ChatbotProvider>
        </AuthProvider>
    );
};

export default App;
