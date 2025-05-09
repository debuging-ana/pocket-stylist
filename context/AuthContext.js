import { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from "../firebaseConfig"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    //returns a value AND return a function . 
    // Ex: user = Ana, setUser will update the value of user automatically when calling the fuction.
    const [user, setUser] = useState(null);
    const auth = getAuth(app);

    useEffect(() => {
        //check if the user is allowed in or not. will check if you managed to login or not.
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);