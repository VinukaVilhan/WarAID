import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import { Bell, X, Newspaper } from "lucide-react";
import AlertSlider from "./AlertSlider";
import axios from "axios";
import logo from "../../assets/waraid.png";

const Navbar = () => {
    const { state, signIn, signOut, getBasicUserInfo } = useAuthContext();
    const [userRole, setUserRole] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [newsAlerts, setNewsAlerts] = useState([]);
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
    const location = useLocation();

    useEffect(() => {
        getBasicUserInfo()
            .then((response) => {
                console.log(response);
                setUserRole(response.roles);
            })
            .catch((error) => {
                console.error(error);
            });

        fetchNews();
    }, [state.isAuthenticated, getBasicUserInfo]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentAlertIndex(
                (prevIndex) => (prevIndex + 1) % newsAlerts.length
            );
        }, 10000); // Change news alert every 10 seconds

        return () => clearInterval(intervalId);
    }, [newsAlerts]);

    const fetchNews = async () => {
        try {
            const response = await axios.get("http://localhost:8060/news");
            if (response.data && response.data.articles) {
                setNewsAlerts(
                    response.data.articles.map((article) => ({
                        title: article.title,
                        url: article.url,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    const isActivePage = (path) => {
        return location.pathname === path;
    };

    const isAdmin = userRole === "Admin";

    const navLinkStyles = (path) => `
    block mt-4 lg:inline-block lg:mt-0 
    text-[#004AAD] hover:text-white hover:bg-[#004AAD] 
    px-3 py-2 rounded-md mr-4
    relative
    ${
        isActivePage(path)
            ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-[#004AAD]"
            : ""
    }
  `;

    const toggleAlertSlider = () => {
        setIsAlertOpen(!isAlertOpen);
    };

    return (
        <div>
            {/* News Alerts Bar */}
            {newsAlerts.length > 0 && (
                <div className="w-full py-2 px-4 text-center bg-blue-600 text-white">
                    <div className="flex items-center justify-center">
                        <Newspaper className="mr-2" size={20} />
                        <a
                            href={newsAlerts[currentAlertIndex].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            {newsAlerts[currentAlertIndex].title}
                        </a>
                    </div>
                </div>
            )}

            <nav className="flex items-center justify-between flex-wrap bg-white p-6 px-4 shadow-md relative">
                {/* Logo Section */}
                <div className="flex items-center flex-shrink-0 ml-20">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="War Aid App Logo"
                            className="h-14 mr-2"
                        />
                    </Link>
                </div>
                {/* Mobile Menu Button */}
                <div className="block lg:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white"
                    >
                        <svg
                            className="fill-current h-3 w-3"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                        </svg>
                    </button>
                </div>
                {/* Navigation Links, Auth Button, and Bell Icon - Collapsible */}
                <div
                    className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${
                        isMenuOpen ? "block" : "hidden"
                    }`}
                >
                    <div className="lg:flex lg:justify-center lg:flex-1">
                        <Link to="/" className={navLinkStyles("/")}>
                            Homepage
                        </Link>
                        <Link
                            to="/ResourceLocator"
                            className={navLinkStyles("/ResourceLocator")}
                        >
                            Resource Locator
                        </Link>
                        <Link
                            to="/Documentation"
                            className={navLinkStyles("/Documentation")}
                        >
                            Documentation Tool
                        </Link>
                        <Link
                            to="/EmergencyContacts"
                            className={navLinkStyles("/EmergencyContacts")}
                        >
                            Emergency Contacts
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/Manage"
                                className={navLinkStyles("/Manage")}
                            >
                                Manage
                            </Link>
                        )}
                    </div>
                    {/* Auth Button and Bell Icon */}
                    <div className="mt-4 lg:mt-0 lg:ml-4 flex items-center">
                        {state?.isAuthenticated ? (
                            <button
                                onClick={() => signOut()}
                                className="w-48 lg:w-auto inline-block px-10 py-2 leading-none border rounded text-white bg-[#004AAD] border-[#004AAD] hover:bg-white hover:text-[#004AAD] mr-4"
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => signIn()}
                                className="w-48 lg:w-auto inline-block px-4 py-2 leading-none border rounded text-white bg-[#004AAD] border-[#004AAD] hover:bg-white hover:text-[#004AAD] mr-4"
                            >
                                Login / Signup
                            </button>
                        )}
                        {/* Bell Icon - Always visible */}
                        <button
                            onClick={toggleAlertSlider}
                            className="text-[#004AAD] hover:text-[#002d6b]"
                        >
                            <Bell size={24} />
                        </button>
                    </div>
                </div>

                {/* Alert Slider */}
                <AlertSlider
                    isOpen={isAlertOpen}
                    toggleAlertSlider={toggleAlertSlider}
                />
            </nav>
        </div>
    );
};

export default Navbar;
