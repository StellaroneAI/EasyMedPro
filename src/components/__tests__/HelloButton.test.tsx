import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HelloButton from '../HelloButton';

describe('HelloButton', () => {
  it('increments counter on press', () => {
    const { getByText, getByTestId } = render(<HelloButton />);
    fireEvent.press(getByText('Hello'));
    expect(getByTestId('count')).toHaveTextContent('1');
  });
});
