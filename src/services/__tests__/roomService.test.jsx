import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import roomService from '../../services/roomService'; 

vi.mock('axios');

describe('roomService', () => {
  const mockToken = 'mock-token';
  const mockId = '123';
  const mockRoom = { id: mockId, description: 'Habitación prueba' };
  const mockRooms = [mockRoom];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getRoom devuelve habitación por id', async () => {
    axios.get.mockResolvedValue({ data: mockRoom });

    const result = await roomService.getRoom(mockId, mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/${mockId}`,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockRoom);
  });

  test('getRooms devuelve array de habitaciones', async () => {
    axios.get.mockResolvedValue({ data: mockRooms });

    const result = await roomService.getRooms(mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/all',
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockRooms);
  });

  test('createRoom llama a axios.post y devuelve data', async () => {
    axios.post.mockResolvedValue({ data: mockRoom });

    const result = await roomService.createRoom(mockRoom, mockToken);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin',
      expect.objectContaining({
        id: mockRoom.id,
        description: mockRoom.description,
        roomTypeId: undefined,
        price: NaN,
        status: undefined,
        photoRoom: [],
      }),
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );

    expect(result).toEqual(mockRoom);
  });

  test('updateRoom llama a axios.patch y devuelve data', async () => {
    axios.patch.mockResolvedValue({ data: mockRoom });

    const result = await roomService.updateRoom(mockId, { description: 'Update' }, mockToken);

    expect(axios.patch).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/${mockId}`,
      { description: 'Update' },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    expect(result).toEqual(mockRoom);
  });

  test('deleteRoom llama a axios.delete y devuelve data', async () => {
    axios.delete.mockResolvedValue({ data: mockRoom });

    const result = await roomService.deleteRoom(mockId, mockToken);

    expect(axios.delete).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/${mockId}`,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockRoom);
  });

  test('getRoomTypes llama a axios.get y devuelve data', async () => {
    axios.get.mockResolvedValue({ data: ['Suite', 'Doble'] });

    const result = await roomService.getRoomTypes(mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/roomType',
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(['Suite', 'Doble']);
  });

  test('checkRoomIdAvailability devuelve disponible si 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const result = await roomService.checkRoomIdAvailability('roomId123', mockToken);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/roomId123',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ exists: false, available: true });
  });

  test('checkRoomIdAvailability devuelve exists si 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const result = await roomService.checkRoomIdAvailability('roomId123', mockToken);

    expect(result).toEqual({ exists: true, available: false });
  });
});
