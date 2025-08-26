import React from 'react';
import { vi, describe, test, expect } from 'vitest';

// Mock del App
vi.mock('../App.jsx', () => ({
  default: () => <div>Mock App</div>,
}));

// Mock de ReactDOM.createRoot
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  },
}));

import ReactDOM from 'react-dom/client';
import '../index.css';
import App from '../App.jsx';

describe('index.jsx', () => {
  test('ReactDOM.createRoot es llamado y App se renderiza', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);

    // Ejecuta el render real
    await import('../main.jsx');

    // Verificar createRoot
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootDiv);

    const renderFn = ReactDOM.createRoot.mock.results[0].value.render;
    expect(renderFn).toHaveBeenCalled();

    // Verificar que el primer argumento pasado a render contiene App en algún lugar
    const renderArg = renderFn.mock.calls[0][0];
    // Solo comprobamos que App está incluido en el tree
    const containsApp = (element) => {
      if (!element) return false;
      if (element.type === App) return true;
      if (element.props && element.props.children) {
        const children = Array.isArray(element.props.children)
          ? element.props.children
          : [element.props.children];
        return children.some(containsApp);
      }
      return false;
    };
    expect(containsApp(renderArg)).toBe(true);

    document.body.removeChild(rootDiv);
  });
});
