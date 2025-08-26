import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import reservationService from '../../services/reservationService'; // ajusta la ruta si hace falta

vi.mock('axios');

describe('reservationService', () => {
  const mockToken = 'mock-token';
  const mockId = '123';
  const mockData = { guestName: 'Juan', room: '101' };

  beforeEach(() => {
    vi.clearAllMocks(); // limpiar mocks antes de cada test
  });

  test('getReservations devuelve un array', async () => {
    axios.get.mockResolvedValue({ data: [mockData] });

    const result = await reservationService.getReservations(mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/reservations/admin',
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual([mockData]);
  });

  test('createReservation llama a axios.post y devuelve data', async () => {
    axios.post.mockResolvedValue({ data: mockData });

    const result = await reservationService.createReservation(mockData, mockToken);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/reservations/admin',
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('updateReservationByAdmin llama a axios.patch y devuelve data', async () => {
    axios.patch.mockResolvedValue({ data: mockData });

    const result = await reservationService.updateReservationByAdmin(mockId, mockData, mockToken);

    expect(axios.patch).toHaveBeenCalledWith(
      `http://localhost:3000/api/reservations/admin/${mockId}`,
      mockData,
      { headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual(mockData);
  });

  test('updateReservationByAdmin lanza error 409', async () => {
    axios.patch.mockRejectedValue({
      response: { status: 409, data: { mensaje: 'Conflicto' } },
    });

    await expect(reservationService.updateReservationByAdmin(mockId, mockData, mockToken))
      .rejects.toThrow('Conflicto');
  });

  test('deleteReservation devuelve success true si status 200', async () => {
    axios.delete.mockResolvedValue({ status: 200, data: mockData });

    const result = await reservationService.deleteReservation(mockId, mockToken);

    expect(result).toEqual({
      success: true,
      data: mockData,
      message: 'Reserva eliminada exitosamente',
    });
  });

  test('confirmReservationByAdmin llama a axios.patch y devuelve data', async () => {
    axios.patch.mockResolvedValue({ status: 200, data: mockData });

    const result = await reservationService.confirmReservationByAdmin(mockId, mockToken, mockData);

    expect(result).toEqual(mockData);
  });

  test('cancelReservationWithRefund devuelve success true si status 200', async () => {
    axios.patch.mockResolvedValue({ status: 200, data: mockData });

    const result = await reservationService.cancelReservationWithRefund(mockId, mockToken);

    expect(result).toEqual({
      success: true,
      data: mockData,
      message: 'Reserva cancelada y reembolso procesado',
    });
  });
});
