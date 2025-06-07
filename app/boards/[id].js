import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Feather } from '@expo/vector-icons';

export default function BoardDetail() {
  const { id } = useLocalSearchParams();
  const { user, deletePinFromBoard } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * fetches and listens for board data changes in realtime
   * this effect sets up a firestore snapshot listener to keep the board data in sync
   * it automatically updates when pins are added or removed from the board
   */
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const boards = userData.boards || [];
          const foundBoard = boards.find(b => b.id === id);

          if (foundBoard) {
            setBoard({
              ...foundBoard,
              pins: foundBoard.pins || []
            });
          } else {
            setBoard(null);
          }
        } else {
          console.log("User document doesn't exist");
          setBoard(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error:", error);
        console.log("Error details:", error.code, error.message);
        setBoard(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading board...</Text>
      </View>
    );
  }

  if (!board) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Board not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* board header showing title & pin count */}
      <View style={styles.boardHeader}>
        <Text style={styles.boardTitle}>{board.title}</Text>
        <Text style={styles.pinCount}>{board.pins.length} {board.pins.length === 1 ? 'Pin' : 'Pins'}</Text>
      </View>

      {/* pins grid - displays all pins in the board */}
      {board.pins.length > 0 ? (
        <FlatList
          data={board.pins}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.pinsContainer}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.pinContainer}>
              <Image 
                source={{ uri: item.imageUri }}
                style={styles.pinImage}
              />
              {/* delete button - removes pin from board */}
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deletePinFromBoard(id, item.id)}
              >
                <Feather name="trash-2" size={22} color="#995454" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        /* empty state when board has no pins */
        <View style={styles.emptyState}>
          <Feather name="inbox" size={48} color="#DFBDBD" />
          <Text style={styles.emptyText}>No pins yet</Text>
          <Text style={styles.emptySubtext}>Add pins from the Explore page</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F4',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F4',
  },
  errorText: {
    fontSize: 18,
    color: '#828282',
  },
  boardHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  boardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 4,
  },
  pinCount: {
    fontSize: 16,
    color: '#828282',
  },
  pinsContainer: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pinContainer: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pinImage: {
    width: '100%',
    aspectRatio: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#4A6D51',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#828282',
    marginTop: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#DFBDBD',
    borderRadius: 15,
    padding: 5
  }
});