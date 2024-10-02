import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

const Navbar = () => {
  const { state, signIn, signOut } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-blue-700 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z"/>
        </svg>
        <span className="font-semibold text-xl tracking-tight">War Aid App</span>
      </div>
      <div className="block lg:hidden">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white"
        >
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
          </svg>
        </button>
      </div>
      <div className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="text-sm lg:flex-grow">
          <Link to="/" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
            Homepage
          </Link>
          <Link to="/ResourceLocator" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
            Resource Locator
          </Link>
          <Link to="/Documentation" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
            Documentation Tool
          </Link>
          <Link to="/ChatBot" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white">
            Chatbot
          </Link>
        </div>
        <div className="mt-4 lg:mt-0">
          {state?.isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="w-full lg:w-auto inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="w-full lg:w-auto inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;