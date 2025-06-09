import { render, fireEvent, act } from '@testing-library/react-native';
import MadeForYou from '../app/made-for-you';

jest.mock('../services/openAI', () => ({
  generateImageFromPrompt: jest.fn(),
}));

describe('MadeForYou Component', () => {
  it('verify if the "generate outfit" buttom is desabled because it doesnt work without the outfit details.', async () => {
    const { getByTestId } = render(<MadeForYou />);
    const button = getByTestId('generate-outfit-button');
    fireEvent.press(button);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('verify if the "generate outfit" buttom is able when the user types what they expect to get. ', async () => {
    const { getByTestId } = render(<MadeForYou />);
    const input = getByTestId('my-outfit-details');

    await act(async () => {
      fireEvent.changeText(input, 'casual and cozy style');
    });

    const button = getByTestId('generate-outfit-button');
    expect(button.props.accessibilityState.disabled).toBe(false);
  });
});