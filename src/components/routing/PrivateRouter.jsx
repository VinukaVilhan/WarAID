import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const { state, signIn, getIDToken } = useAuthContext();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      try {
        const idToken = await getIDToken();
        console.log('ID Token:', idToken); // Log the ID token for debugging

        if (!idToken) {
          throw new Error("No ID token available");
        }

        // Validate the ID token with the backend
        const response = await axios.get('http://localhost:8050/secured/admin', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.status === 200) {
          setIsAuthorized(true);  // Token validation successful
          setError('');
        }
      } catch (error) {
        console.error('Authorization failed', error);
        setIsAuthorized(false);
        setError('You are not authorized to view this page.');
      } finally {
        setLoading(false);  // Loading completed regardless of success or failure
      }
    };

    if (state.isAuthenticated) {
      validateToken();  // Validate the ID token if the user is authenticated
    } else {
      signIn();  // Trigger sign-in if not authenticated
      setLoading(false);
    }
  }, [getIDToken, signIn, state.isAuthenticated]);

  // If the token validation is still in progress, show a loading indicator
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
             <div className="text-xl font-semibold">Loading...</div>
           </div>;
  }

  // If not authenticated or not authorized, redirect to home page
  if (!state.isAuthenticated || !isAuthorized) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // If there's an error during token validation, show the error
  if (error) {
    return <div className="flex items-center justify-center h-screen">
             <div className="text-red-500 text-xl font-semibold">{error}</div>
           </div>;
  }

  // Render the protected route's children if the user is authenticated and authorized
  return children;
};

export default PrivateRoute;
