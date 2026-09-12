import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import HelloButton from '../HelloButton';

describe('HelloButton', () => {
  it('increments counter on click', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<HelloButton />);
    });

    const button = container.querySelector('button');
    const count = () => container.querySelector('[data-testid="count"]')?.textContent;

    expect(button).not.toBeNull();
    expect(count()).toBe('0');

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(count()).toBe('1');
  });
});
