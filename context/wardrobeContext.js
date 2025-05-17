import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore"; 
import { useAuth } from './AuthContext';

const WardrobeContext = createContext();

export const WardrobeProvider = ({ children }) => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const { user } = useAuth();

  // load items from Firestore when user logs in
  useEffect(() => {
    if (user) {
      loadItems();
    } else {
      setWardrobeItems([]); // clear items from state if user logs out
    }
  }, [user]);

  //function to load wardrobe items from Firestore
  const loadItems = async () => {
    if (!user) return;
    
    try {
      // get all documents from wardrobe subcollection under current user's document
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "wardrobe"));
      const items = [];
      //iterate thru the returned documents & format them
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setWardrobeItems(items);
    } catch (error) {
      console.error("Error loading items: ", error);
    }
  };

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
      const completeItem = { ...newItem, id: newId };
      
      // save the new item in Firestore under the user's wardrobe subcollection
      await setDoc(doc(db, "users", user.uid, "wardrobe", newId), completeItem);
      
      // adds the new item to local state
      setWardrobeItems([...wardrobeItems, completeItem]);
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
      // overwrite the item in Firestore w the updated data
      await setDoc(doc(db, "users", user.uid, "wardrobe", updatedItem.id), updatedItem);
      
      // update local state
      setWardrobeItems(wardrobeItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
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