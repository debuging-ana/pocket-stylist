import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { app, db } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const auth = getAuth(app);
  const isLoggingOutRef = useRef(false);
  const unsubscribeUserRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isLoggingOutRef.current) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        // Clean up any existing listener first
        if (unsubscribeUserRef.current) {
          unsubscribeUserRef.current();
        }

        // setup snapshot listener
        unsubscribeUserRef.current = onSnapshot(
          userDocRef,
          (userDoc) => {
            // Skip state updates if user is logging out
            if (isLoggingOutRef.current) return;
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData({
                ...data,
                boards: data.boards || [],
                looks: data.looks || []
              });
            } else {
              setUserData(null);
            }
          },
          (error) => {
            // Skip error handling if user is logging out
            if (isLoggingOutRef.current) return;
            console.error("Snapshot error:", error);
            setUserData(null);
          }
        );
      } else {
        // Clean up user listener when user logs out
        if (unsubscribeUserRef.current) {
          unsubscribeUserRef.current();
          unsubscribeUserRef.current = null;
        }
        
        if (!isLoggingOutRef.current) {
          setUserData(null);
          setAuthUser(null);
        }
      }
      
      if (!isLoggingOutRef.current) {
        setAuthUser(firebaseUser);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
      }
    };
  }, []);

  const logout = async () => {
    try {
      // Set logout flag first to prevent any new listeners or state updates
      isLoggingOutRef.current = true;
      
      // Clean up the user data listener immediately
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = null;
      }
      
      // Clear state immediately
      setUserData(null);
      setAuthUser(null);
      
      // Wait a brief moment for other contexts to clean up
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now sign out from Firebase
      await signOut(auth);
      
      // Reset the flag after logout completes
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 1000);
    } catch (error) {
      isLoggingOutRef.current = false;
      console.error("Error logging out: ", error);
    }
  };

  /**
   * Adds a pin to a specific board for the currently authenticated user
   * How it works:
     - fetches the current users boards from Firestore
     - checks if the board ID matches
     - If the pin already exists in that board, it should throw an error to avoid duplicates
     - Otherwise it appends the pin & writes the updated boards back to Firestore
   */
  const addPinToBoard = async (boardId, pin) => {
    if (!authUser?.uid) return;

    try {
      const userRef = doc(db, "users", authUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const updatedBoards = (userSnap.data().boards || []).map(board => {
        if (board.id === boardId) {
          // prevent duplicates 
          const exists = board.pins?.some(p => p.id === pin.id);
          if (exists) throw new Error("Duplicate pin");

          return {
            ...board,
            pins: [...(board.pins || []), pin]
          };
        }
        return board;
      });

      await updateDoc(userRef, { boards: updatedBoards });
      setUserData(prev => ({ ...prev, boards: updatedBoards }));

    } catch (error) {
      console.error("Error adding pin:", error);
      throw error; // propagate the error to the UI
    }
  };

  /**
   * Deletes a specific pin from a users board 
   * How it works:
     - fetches the current users boards from Firestore
     - locates the board that matches the provided boardId
     - filters out the pin with the matching pinId
     - writes the updated board data back to Firestore
     - updates local state to reflect the change immediately in the UI
   */
  const deletePinFromBoard = async (boardId, pinId) => {
    if (!authUser?.uid) return;

    try {
      const userRef = doc(db, "users", authUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const updatedBoards = (userSnap.data().boards || []).map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            pins: board.pins?.filter(p => p.id !== pinId) || []
          };
        }
        return board;
      });

      await updateDoc(userRef, { boards: updatedBoards });
      setUserData(prev => ({ ...prev, boards: updatedBoards }));
      Alert.alert("Success", "Pin removed from board!");
    } catch (error) {
      Alert.alert("Error", "Failed to remove pin");
    }
  };

  return (
    <AuthContext.Provider value={{
      user: authUser,
      userData,
      logout,
      addPinToBoard,
      deletePinFromBoard
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
