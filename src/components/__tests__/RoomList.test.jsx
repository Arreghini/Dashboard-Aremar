import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomList from '../RoomList';
import roomService from '../../services/roomService';
import roomClasifyService from '../../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';
import { vi, describe, beforeEach, test, expect } from 'vitest';

// Mock de servicios
vi.mock('../../services/roomService');
vi.mock('../../services/roomClasifyService');
vi.mock('@auth0/auth0-react');

describe('RoomList', () => {
  const mockRooms = [
    {
      id: 'R1',
      description: 'Habitación prueba',
      price: 100,
      status: 'available',
      photoRoom: ['photo1.jpg'],
      roomTypeId: 'T1',
      detailRoomId: 'D1',
    },
  ];

  const mockRoomTypes = [{ id: 'T1', name: 'Suite' }];
  const mockRoomDetails = [{ id: 'D1', cableTvService: true, wifi: true }];

  const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('fake-token');

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    roomService.getRooms.mockResolvedValue({ success: true, data: mockRooms });
    roomClasifyService.getRoomTypes.mockResolvedValue(mockRoomTypes);
    roomClasifyService.getAllRoomDetails.mockResolvedValue(mockRoomDetails);
    roomClasifyService.testConnection = vi.fn().mockResolvedValue(true);
    roomService.deleteRoom.mockResolvedValue();
  });

  test('renders loading state initially', () => {
    render(<RoomList />);
    expect(screen.getByText(/Cargando habitaciones/i)).toBeInTheDocument();
  });

  test('renders rooms correctly', async () => {
    render(<RoomList />);

    // Espera a que termine la carga de habitaciones
    await waitFor(() => expect(screen.getByText('R1')).toBeInTheDocument());

    // Selecciona el contenedor principal de la habitación
    const roomRow = screen.getByText('R1').closest('div');

    expect(roomRow).toBeInTheDocument();

    // Verifica precio con regex flexible (para emojis y espacios)
    expect(roomRow).toHaveTextContent(/💰\s*Precio:\s*100/i);

    // Verifica que esté marcada como disponible
    expect(roomRow).toHaveTextContent(/✅\s*Disponible/i);
  });

  test('edit button opens modal', async () => {
    render(<RoomList />);
    await waitFor(() => screen.getByText('R1'));

    const editButton = screen.getByText('✏️ Editar');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText(/Editar habitación R1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descripción/i)).toHaveValue('Habitación prueba');
    });
  });

  test('delete button calls deleteRoom', async () => {
    // Simular confirm de window
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<RoomList />);
    await waitFor(() => screen.getByText('R1'));

    const deleteButton = screen.getByText('🗑️ Eliminar');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(roomService.deleteRoom).toHaveBeenCalledWith('R1', 'fake-token');
    });
  });
});
