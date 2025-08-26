import { global } from 'window-or-global';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ReportsPage from '../ReportsPage';

// 👉 Mock de Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
  }),
}));

// 👉 Mock de fetch global
global.fetch = vi.fn();

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente y cambia las fechas', () => {
    render(<ReportsPage darkMode={true} />);

    const startInput = screen.getByLabelText(/fecha inicio/i);
    const endInput = screen.getByLabelText(/fecha fin/i);

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();

    fireEvent.change(startInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endInput, { target: { value: '2025-01-31' } });

    expect(startInput.value).toBe('2025-01-01');
    expect(endInput.value).toBe('2025-01-31');
  });

  test('descarga el reporte correctamente', async () => {
    // 👉 simulamos respuesta de fetch con un blob
    const mockBlob = new Blob(['excel data'], { type: 'application/vnd.ms-excel' });
    fetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ReportsPage darkMode={false} />);

    const button = screen.getByRole('button', { name: /descargar reporte excel/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/admin/export/excel/analytics',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });
  });
});
