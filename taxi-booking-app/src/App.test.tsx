import { render } from '@testing-library/react';
// Remove BrowserRouter import as it's not needed here
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <App />
    );
    expect(true).toBe(true); // Si render no lanzó un error, la prueba pasa.
  });
});