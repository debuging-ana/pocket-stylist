import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AiFiltersScreen() {
  const [filters, setFilters] = useState({
    gender: false,
    bodyType: false,
    lifestyle: false,
  });

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="filter-list" size={80} color="#7D7D7D" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.filtersContainer}>
          {Object.entries(filters).map(([key, value]) => (
            <Pressable key={key} style={styles.filterOption} onPress={() => toggleFilter(key)}>
              <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <MaterialIcons name="check" size={18} color="white" />}
              </View>
              <Text style={styles.filterText}>{capitalize(key)}</Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7D7D7D',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 40,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#7D7D7D',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7D7D7D',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: '#4A6D51',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
