import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore"; 
import { useAuth } from './AuthContext';

const WardrobeContext = createContext();

export const WardrobeProvider = ({ children }) => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }, (error) => {
        console.error("Error listening to wardrobe updates:", error);
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      setWardrobeItems([]); // clear items from state if user logs out
      setLoading(false);
    }
  }, [user]);

  // Set up real-time listener for saved outfits
  useEffect(() => {
    if (user) {
      console.log('Setting up outfit listener for user:', user.uid);
      
      const q = query(
        collection(db, "users", user.uid, "outfits"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Outfit listener triggered, snapshot size:', snapshot.size);
        
        const outfits = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing outfit document:', doc.id, data);
          outfits.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        
        console.log('Setting saved outfits, count:', outfits.length);
        setSavedOutfits(outfits);
      }, (error) => {
        console.error("Error listening to outfit updates:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
      });

      return () => {
        console.log('Cleaning up outfit listener');
        unsubscribe();
      };
    } else {
      console.log('No user, clearing saved outfits');
      setSavedOutfits([]);
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

  const addOutfit = async (outfitData) => {
    if (!user) {
      console.log("User not logged in");
      throw new Error("User not logged in");
    }

    try {
      console.log('Adding outfit to context:', outfitData);
      console.log('User ID:', user.uid);
      
      const completeOutfit = {
        ...outfitData,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      };

      console.log('Complete outfit data:', completeOutfit);
      console.log('Saving to path: users/' + user.uid + '/outfits/' + outfitData.id);

      await setDoc(doc(db, "users", user.uid, "outfits", outfitData.id), completeOutfit);
      console.log('Outfit saved successfully to Firestore with ID:', outfitData.id);
      
      // Verify the outfit was saved by checking the current state
      console.log('Current saved outfits count:', savedOutfits.length);
      
    } catch (error) {
      console.error("Error saving outfit:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw error;
    }
  };

  const deleteOutfit = async (outfitId) => {
    if (!user) {
      console.log("User not logged in");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "outfits", outfitId));
      console.log('Outfit deleted successfully');
    } catch (error) {
      console.error("Error deleting outfit:", error);
      throw error;
    }
  };

  const updateOutfit = async (outfitData) => {
    if (!user) {
      console.log("User not logged in");
      throw new Error("User not logged in");
    }

    try {
      console.log('Updating outfit:', outfitData.id);
      
      const updatedOutfit = {
        ...outfitData,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid, "outfits", outfitData.id), updatedOutfit, { merge: true });
      console.log('Outfit updated successfully');
      
    } catch (error) {
      console.error("Error updating outfit:", error);
      throw error;
    }
  };

  return (
    <WardrobeContext.Provider 
      value={{ 
        wardrobeItems, 
        savedOutfits,
        loading,
        addItem, 
        updateItem, 
        deleteItem,
        addOutfit,
        deleteOutfit,
        updateOutfit
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => useContext(WardrobeContext);