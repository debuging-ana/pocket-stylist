/*
 this context manages our wardrobe items state and provides
 includes simple functions to add, update & delete items
*/
import { createContext, useState, useContext } from 'react';

const WardrobeContext = createContext();

export const WardrobeProvider = ({ children }) => {
  // state to store our wardrobe items - starts empty
  const [wardrobeItems, setWardrobeItems] = useState([]);

  // function to add a new item to the wardrobe
  const addItem = (newItem) => {
    // basic validation that checks if required fields exist
    if (!newItem.name || !newItem.category || !newItem.imageUri) {
      console.log('Almost there! Please fill in the missing details');
      return; 
    }

    // more reliable ID than using just Date.now()
    const newId = Date.now() + '-' + Math.floor(Math.random() * 1000);

    // create the complete item with our generated ID
    const completeItem = {
      ...newItem, 
      id: newId   
    };

    // adds the new item to our wardrobe state
    setWardrobeItems([...wardrobeItems, completeItem]);
  };

  // function to update an existing item
  const updateItem = (updatedItem) => {
    if (!wardrobeItems.some(item => item.id === updatedItem.id)) {
      console.log("Item not found - cannot update");
      return;
    }

    // update the item by mapping through the array
    setWardrobeItems(wardrobeItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  // to delete an item by its ID
  const deleteItem = (itemId) => {
    setWardrobeItems(wardrobeItems.filter(item => item.id !== itemId));
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