
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import ChatBot from "./components/ChatBot";
import Documentation from "./components/Documentation";
import ResourceLocator from "./components/ResourceLocator";
import { AuthProvider } from "@asgardeo/auth-react";
import Header from "./components/Header";

const authConfig = {
    signInRedirectURL: "http://localhost:5173/",
    signOutRedirectURL: "http://localhost:5173/",
    clientID: "h14EPNFXyNu73kfxGTk_bEcgjfUa",
    baseUrl: "https://api.asgardeo.io/t/dana",
    scope: ["openid", "profile"],
};

const AppContent = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ChatBot" element={<ChatBot />} />
                <Route path="/Documentation" element={<Documentation />} />
                <Route path="/ResourceLocator" element={<ResourceLocator />} />
            </Routes>
        </>
    );
};

const App = () => (
    <AuthProvider config={authConfig}>
        <Router>
            <AppContent />
        </Router>
    </AuthProvider>
);

export default App;
