import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomTypeList from '../RoomTypeList';
import roomClasifyService from '../../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';
import RoomTypeEditModal from '../molecules/RoomTypesEditModal';

// Mocks
vi.mock('../../services/roomClasifyService');
vi.mock('@auth0/auth0-react');
vi.mock('../molecules/RoomTypesEditModal', () => ({
  default: ({ isOpen }) => isOpen ? <div>Modal Abierto</div> : null,
}));

describe('RoomTypeList', () => {
  const mockRoomTypes = [
    {
      id: '1',
      name: 'Suite',
      simpleBeds: 1,
      trundleBeds: 1,
      kingBeds: 1,
      windows: 2,
      price: 5000,
      photos: ['https://example.com/photo1.jpg'],
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
    });

    roomClasifyService.getRoomTypes.mockResolvedValue(mockRoomTypes);
    roomClasifyService.deleteRoomType.mockResolvedValue({});
    roomClasifyService.updateRoomTypeWithFiles.mockResolvedValue({});
  });

  it('muestra la lista de tipos de habitación', async () => {
    render(<RoomTypeList refresh={false} />);

    await waitFor(() => {
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.getByText(/💰 Precio:/)).toBeInTheDocument();
    });
  });

  it('abre el modal al hacer click en editar', async () => {
    render(<RoomTypeList refresh={false} />);

    await waitFor(() => screen.getByText('Suite'));

    const editButton = screen.getByText(/✏️ Editar/);
    fireEvent.click(editButton);

    expect(screen.getByText('Modal Abierto')).toBeInTheDocument();
  });

  it('llama a deleteRoomType al confirmar eliminación', async () => {
    window.confirm = vi.fn(() => true); // Simula confirmar eliminación

    render(<RoomTypeList refresh={false} />);

    await waitFor(() => screen.getByText('Suite'));

    const deleteButton = screen.getByText(/🗑️ Eliminar/);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(roomClasifyService.deleteRoomType).toHaveBeenCalledWith(
        '1',
        'fake-token'
      );
    });
  });

  it('no elimina si el usuario cancela confirm', async () => {
    window.confirm = vi.fn(() => false); // Cancela eliminación

    render(<RoomTypeList refresh={false} />);

    await waitFor(() => screen.getByText('Suite'));

    const deleteButton = screen.getByText(/🗑️ Eliminar/);
    fireEvent.click(deleteButton);

    expect(roomClasifyService.deleteRoomType).not.toHaveBeenCalled();
  });
});
