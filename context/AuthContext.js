import { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const auth = getAuth(app);

    useEffect(() => {
        // Check if the user is allowed in or not. Will check if you managed to login or not.
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return unsubscribe;
    }, []);

    // Logout function
    const logout = async () => {
        try {
            await signOut(auth);  // Firebase logout method
            setUser(null);         // Update the user state to null after logging out
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
