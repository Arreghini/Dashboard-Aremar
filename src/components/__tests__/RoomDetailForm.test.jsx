
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RoomDetailForm from '../RoomDetailForm';
import roomClasifyService from '../../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

// Mock de Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

// Mock de roomClasifyService
vi.mock('../../services/roomClasifyService', () => ({
  default: {
    getAllRoomDetails: vi.fn(),
    createRoomDetail: vi.fn(),
    updateRoomDetail: vi.fn(),
    deleteRoomDetail: vi.fn(),
  },
}));

describe('RoomDetailForm', () => {
  const getAccessTokenSilentlyMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth0.mockReturnValue({ getAccessTokenSilently: getAccessTokenSilentlyMock });
    getAccessTokenSilentlyMock.mockResolvedValue('fake-token');
    roomClasifyService.getAllRoomDetails.mockResolvedValue([]);
    roomClasifyService.createRoomDetail.mockResolvedValue({ data: { id: '1', wifi: true } });
  });

  test('renderiza el formulario y los checkboxes de servicios', async () => {
    render(<RoomDetailForm />);
    // Esperamos que los checkboxes estén en pantalla
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    expect(screen.getByText(/Administrador de Combinaciones de Servicios/i)).toBeInTheDocument();
  });

  test('permite crear una nueva combinación de servicios', async () => {
    const onRoomDetailCreated = vi.fn();
    render(<RoomDetailForm onRoomDetailCreated={onRoomDetailCreated} />);

    // Marcamos algunos checkboxes
    const wifiCheckbox = screen.getByRole('checkbox', { name: /WiFi/i });
    fireEvent.click(wifiCheckbox);

    const submitButton = screen.getByRole('button', { name: /crear/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(roomClasifyService.createRoomDetail).toHaveBeenCalledTimes(1);
      expect(onRoomDetailCreated).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/✅ Nueva combinación de servicios creada con éxito/i)).toBeInTheDocument();
    });
  });

  test('muestra error si la combinación ya existe', async () => {
    // Mock para que ya exista una combinación
    roomClasifyService.getAllRoomDetails.mockResolvedValue([
      { id: '1', wifi: true, cableTvService: false, smart_TV: false, microwave: false, pava_electrica: false },
    ]);

    render(<RoomDetailForm />);

    const wifiCheckbox = await screen.findByRole('checkbox', { name: /WiFi/i });
    fireEvent.click(wifiCheckbox); // ya está marcado por default
    const submitButton = screen.getByRole('button', { name: /crear/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Esta combinación de servicios ya existe/i)).toBeInTheDocument();
      expect(roomClasifyService.createRoomDetail).not.toHaveBeenCalled();
    });
  });
});
