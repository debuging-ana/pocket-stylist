import { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { app, db } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    let unsubscribeUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        // setup snapshot listener FIRST
        unsubscribeUser = onSnapshot(
          userDocRef,
          (userDoc) => {
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
            console.error("Snapshot error:", error);
            setUserData(null);
          }
        );
      } else {
        setUserData(null);
        setAuthUser(null);
      }
      setAuthUser(firebaseUser);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      setUserData(null);
    } catch (error) {
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
