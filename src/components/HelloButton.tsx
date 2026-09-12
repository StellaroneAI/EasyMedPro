import React, { useState } from 'react';

export default function HelloButton() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button type="button" onClick={() => setCount(c => c + 1)}>
        Hello
      </button>
      <span data-testid="count">{count}</span>
    </div>
  );
}
