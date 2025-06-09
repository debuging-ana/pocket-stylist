import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PasswordChangeForm from '../components/PasswordChangeForm';

test('save button enables when valid passwords entered', () => {
  const { getByPlaceholderText, getByTestId } = render(<PasswordChangeForm />);
  
  const currentPasswordInput = getByPlaceholderText('Current Password');
  const newPasswordInput = getByPlaceholderText('New Password');
  const saveButton = getByTestId('save-button');

  // Initial state - button disabled
  expect(saveButton.props.disabled).toBe(true);

  // Enter valid passwords
  fireEvent.changeText(currentPasswordInput, 'oldSecurePass123');
  fireEvent.changeText(newPasswordInput, 'newSecurePass123');
  
  // Test should fail here initially
  expect(saveButton.props.disabled).toBe(false);
});