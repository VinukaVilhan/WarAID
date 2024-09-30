import { useAuthContext } from "@asgardeo/auth-react";
import { NavLink } from "react-router-dom";

const Header = () => {
    const { state, signIn, signOut } = useAuthContext();

    return (
        <div className="header">
            {state?.isAuthenticated ? (
                <button onClick={() => signOut()}>Logout</button>
            ) : (
                <button onClick={() => signIn()}>Login</button>
            )}
        </div>
    );
};

export default Header;
