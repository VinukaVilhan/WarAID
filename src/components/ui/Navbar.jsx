import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import logo from "../../assets/waraid.png";

const Navbar = () => {
    const { state, signIn, signOut } = useAuthContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const { getBasicUserInfo } = useAuthContext();

    useEffect(() => {
        getBasicUserInfo()
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const isActivePage = (path) => {
        return location.pathname === path;
    };

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

    return (
        <nav className="flex items-center justify-between flex-wrap bg-white p-6 px-4 shadow-md">
            {" "}
            {/* Added 'shadow-md' */}
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0 ml-20">
                <img src={logo} alt="War Aid App Logo" className="h-14 mr-2" />
            </div>
            {/* Mobile Menu Button */}
            <div className="block lg:hidden">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center px-3 py-2 border rounded text-[#004AAD] border-[#004AAD] hover:text-white hover:bg-[#004AAD]"
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
            {/* Navigation Links - Centered */}
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
                    <Link to="/ChatBot" className={navLinkStyles("/ChatBot")}>
                        Chatbot
                    </Link>
                </div>
            </div>
            {/* Auth Button */}
            <div className="mt-4 lg:mt-0 mr-20">
                {state?.isAuthenticated ? (
                    <button
                        onClick={() => signOut()}
                        className="w-full lg:w-auto inline-block px-10 py-2 leading-none border rounded text-white bg-[#004AAD] border-[#004AAD] hover:bg-white hover:text-[#004AAD]"
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="w-full lg:w-auto inline-block px-4 py-2 leading-none border rounded text-white bg-[#004AAD] border-[#004AAD] hover:bg-white hover:text-[#004AAD]"
                    >
                        Login / Signup
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
