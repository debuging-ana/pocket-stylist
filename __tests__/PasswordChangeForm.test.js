//for Test-Driven Development
import { render, fireEvent } from '@testing-library/react-native';
import PasswordChangeForm from '../components/PasswordChangeForm';

//example of failing test code (before implementation)
test('save button enables when valid passwords entered', () => {
  const { getByPlaceholderText, getByTestId } = render(<PasswordChangeForm />);

  const currentPasswordInput = getByPlaceholderText('Current Password');
  const newPasswordInput = getByPlaceholderText('New Password');
  const saveButton = getByTestId('save-button');

  //to confirm the save button starts off disabled by checking its accessibility state
  expect(saveButton.props.accessibilityState.disabled).toBe(true); //initially fails

  //simulate typing valid passwords into both input fields
  fireEvent.changeText(currentPasswordInput, 'oldSecurePass123');
  fireEvent.changeText(newPasswordInput, 'newSecurePass123');

  //verify that after entering valid inputs, the save button becomes enabled
  expect(saveButton.props.accessibilityState.disabled).toBe(false);
});
