import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isFormValid = currentPassword.length > 0 && newPassword.length >= 8;

  return (
    <View testID="password-form">
      <TextInput
        placeholder="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        testID="current-password"
      />
      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        testID="new-password"
      />
      <Button
        title="Save"
        disabled={!isFormValid}
        onPress={() => {}}
        testID="save-button"
      />
    </View>
  );
};

export default PasswordChangeForm;