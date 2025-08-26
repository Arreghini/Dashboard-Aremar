import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    expect(screen.getByText(/Administrador de Combinaciones de Servicios/i)).toBeInTheDocument();
  });

  test('permite crear una nueva combinación de servicios', async () => {
    const onRoomDetailCreated = vi.fn();
    render(<RoomDetailForm onRoomDetailCreated={onRoomDetailCreated} />);

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
    // Mock para que el servicio falle con el mensaje de duplicado
    roomClasifyService.createRoomDetail.mockRejectedValueOnce({
      response: { data: { message: 'Esta combinación de servicios ya existe' } },
    });

    render(<RoomDetailForm />);

    const wifiCheckbox = await screen.findByRole('checkbox', { name: /WiFi/i });
    fireEvent.click(wifiCheckbox);

    const submitButton = screen.getByRole('button', { name: /crear/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Esta combinación de servicios ya existe/i)).toBeInTheDocument();
      expect(roomClasifyService.createRoomDetail).toHaveBeenCalledTimes(1);
    });
  });

 test('desactiva el botón de submit si ningún checkbox está seleccionado', async () => {
  render(<RoomDetailForm />);
  
  const submitButton = screen.getByRole('button', { name: /crear/i });
  
  // Desmarcamos todos los checkboxes, incluso los que vienen seleccionados por defecto
  const checkboxes = screen.getAllByRole('checkbox');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) fireEvent.click(checkbox);
  });

  // Verificamos que el botón esté deshabilitado
  expect(submitButton).toBeDisabled();
});

});
