import React from 'react';
import { View, StyleSheet } from 'react-native';

const NotificationBadge = ({ hasUnread, style }) => {
  if (!hasUnread) return null;

  return (
    <View style={[styles.badge, style]} />
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
});

export default NotificationBadge; 