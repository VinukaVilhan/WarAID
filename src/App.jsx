import React from "react";
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react"; // Import useAuthContext
import AppRouter from "./router"; // Router component
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";

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
    const { state } = authContext || { state: {} }; // Handle null safely

    return (
        <AuthProvider config={authConfig}>
            <Router>
                <AppRouter />
            </Router>
        </AuthProvider>
    );
};

export default App;
