// src/hooks/__tests__/useAuthToken.test.jsx
import { renderHook } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import useAuthToken from '../useAuthToken';
import { useAuth0 } from '@auth0/auth0-react';

// Mock general de Auth0
vi.mock('@auth0/auth0-react');

describe('useAuthToken', () => {

  test('obtiene el token correctamente', async () => {
    // Mock de useAuth0 que resuelve la promesa
    useAuth0.mockReturnValue({
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
    });

    const { result } = renderHook(() => useAuthToken());

    const token = await result.current.getToken();

    expect(token).toBe('fake-token');
  });

  test('lanza un error si getAccessTokenSilently falla', async () => {
    // Mock de useAuth0 que rechaza la promesa
    useAuth0.mockReturnValue({
      getAccessTokenSilently: vi.fn().mockRejectedValue(new Error('No se pudo obtener el token')),
    });

    const { result } = renderHook(() => useAuthToken());

    await expect(result.current.getToken()).rejects.toThrow('No se pudo obtener el token');
  });

});
