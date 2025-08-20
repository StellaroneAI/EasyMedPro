import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import useResizeObserver from '../hooks/useResizeObserver';

jest.mock('@capacitor/app', () => ({
  App: { addListener: jest.fn().mockReturnValue({ remove: jest.fn() }) }
}));

describe('Chart resizing', () => {
  it('invokes resize on container size change', () => {
    let observerCallback: () => void = () => {};
    (global as any).ResizeObserver = class {
      constructor(cb: () => void) { observerCallback = cb; }
      observe() {}
      disconnect() {}
    };

    const resize = jest.fn();

    const Chart = () => {
      const ref = React.useRef<HTMLDivElement>(null);
      const chart = React.useRef({ resize });
      useResizeObserver(ref, () => chart.current.resize());
      return <div ref={ref}></div>;
    };

    const container = document.createElement('div');
    act(() => {
      createRoot(container).render(<Chart />);
    });

    act(() => { observerCallback(); });

    expect(resize).toHaveBeenCalled();
  });
});
