//for Test-Driven Development
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isFormValid = currentPassword.length > 0 && newPassword.length > 0;

  return (
    <View>
      <TextInput
        placeholder="Current Password"
        secureTextEntry
        onChangeText={setCurrentPassword}
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        testID="save-button"
        onPress={() => {}}
        disabled={!isFormValid}//the fix that made my test pass
        accessibilityState={{ disabled: !isFormValid }}
        style={{
          backgroundColor: isFormValid ? '#007AFF' : '#ccc',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordChangeForm;
