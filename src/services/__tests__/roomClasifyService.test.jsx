import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import roomClasifyService from '../../services/roomClasifyService';

vi.mock('axios');

describe('roomClasifyService', () => {
  const mockToken = 'mock-token';
  const mockId = '123';
  const mockData = { name: 'Suite', capacity: 2 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getRoomTypes devuelve array de tipos de habitación', async () => {
    const responseData = { success: true, data: [mockData] };
    axios.get.mockResolvedValue({ data: responseData });

    const result = await roomClasifyService.getRoomTypes(mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/roomType',
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual([mockData]);
  });

  test('getRoomDetailById devuelve datos de habitación', async () => {
    axios.get.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.getRoomDetailById(mockId, mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/roomDetail/${mockId}`,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('createRoomType llama a axios.post y devuelve data', async () => {
    axios.post.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.createRoomType(mockData, mockToken);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/roomType',
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('updateRoomType llama a axios.patch y devuelve data', async () => {
    axios.patch.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.updateRoomType(mockId, mockData, mockToken);

    expect(axios.patch).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/roomType/${mockId}`,
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('deleteRoomType devuelve success true si status 200', async () => {
    axios.delete.mockResolvedValue({ status: 200, data: mockData });

    const result = await roomClasifyService.deleteRoomType(mockId, mockToken);

    expect(result).toEqual({
      success: true,
      message: 'Tipo de habitación eliminado correctamente',
      id: mockId,
      data: mockData,
    });
  });

  test('uploadImages llama a axios.post y devuelve data', async () => {
    const files = [new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' })];
    const folder = 'rooms';
    axios.post.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.uploadImages(files, folder, mockToken);

    expect(axios.post).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test('createRoomDetail llama a axios.post y devuelve data', async () => {
    axios.post.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.createRoomDetail(mockData, mockToken);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/rooms/admin/roomDetail',
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('updateRoomDetail llama a axios.patch y devuelve data', async () => {
    axios.patch.mockResolvedValue({ data: mockData });

    const result = await roomClasifyService.updateRoomDetail(mockId, mockData, mockToken);

    expect(axios.patch).toHaveBeenCalledWith(
      `http://localhost:3000/api/rooms/admin/roomDetail/${mockId}`,
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });
});
