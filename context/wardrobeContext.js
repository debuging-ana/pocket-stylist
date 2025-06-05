import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore"; 
import { useAuth } from './AuthContext';

const WardrobeContext = createContext();

export const WardrobeProvider = ({ children }) => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const { user } = useAuth();

  // Set up real-time listener for wardrobe items
  useEffect(() => {
    if (user) {
      // Create a query to order items by creation time
      const q = query(
        collection(db, "users", user.uid, "wardrobe"),
        orderBy("createdAt", "desc")
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        setWardrobeItems(items);
      }, (error) => {
        console.error("Error listening to wardrobe updates:", error);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      setWardrobeItems([]); // clear items from state if user logs out
    }
  }, [user]);

  const addItem = async (newItem) => {
    if (!newItem.name || !newItem.category || !newItem.imageUri) {
      console.log('Almost there! Please fill in the missing details');
      return;
    }

    if (!user) {
      console.log("User not logged in");
      return;
    }

    try {
      const newId = Date.now() + '-' + Math.floor(Math.random() * 1000);
      const completeItem = { 
        ...newItem, 
        id: newId, 
        ownerId: user.uid,
        createdAt: serverTimestamp()
      };
      
      // save the new item in Firestore under the user's wardrobe subcollection
      await setDoc(doc(db, "users", user.uid, "wardrobe", newId), completeItem);
      
      // No need to update local state as the onSnapshot listener will handle it
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const updateItem = async (updatedItem) => {
    if (!wardrobeItems.some(item => item.id === updatedItem.id)) {
      console.log("Item not found - cannot update");
      return;
    }

    if (!user) {
      console.log("User not logged in");
      return;
    }

    try {
      // merge with existing data to preserve ownerId
      const existingItem = wardrobeItems.find(item => item.id === updatedItem.id);
      const mergedItem = { ...existingItem, ...updatedItem };
    
      // overwrite the item in Firestore w the updated data
      await setDoc(doc(db, "users", user.uid, "wardrobe", updatedItem.id), mergedItem);
      
      // update local state
      setWardrobeItems(wardrobeItems.map(item => 
        item.id === updatedItem.id ? mergedItem : item
      ));
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!user) {
      console.log("User not logged in");
      return;
    }

    try {
      // remove item from Firestore
      await deleteDoc(doc(db, "users", user.uid, "wardrobe", itemId));
      
      // remove item from local state
      setWardrobeItems(wardrobeItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  return (
    <WardrobeContext.Provider 
      value={{ 
        wardrobeItems, 
        addItem, 
        updateItem, 
        deleteItem 
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => useContext(WardrobeContext);