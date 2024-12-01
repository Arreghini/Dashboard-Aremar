import React, { useState, useEffect } from 'react';
import reservationService from '../services/reservationService';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleConfirm = async (reservationId) => {
    try {
      await reservationService.confirmReservation(reservationId);
      const updatedReservations = reservations.map(res => 
        res.id === reservationId ? { ...res, status: 'confirmed' } : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al confirmar la reservación:', error);
    }
  };

  const handleCancel = async (reservationId) => {
    try {
      await reservationService.cancelReservation(reservationId);
      const updatedReservations = reservations.map(res => 
        res.id === reservationId ? { ...res, status: 'cancelled' } : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al cancelar la reservación:', error);
    }
  };

  const handleDelete = async (reservationId) => {
    try {
      await reservationService.deleteReservation(reservationId);
      const updatedReservations = reservations.filter(res => res.id !== reservationId);
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al eliminar la reservación:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Reservaciones</h2>
      {reservations.length === 0 ? (
        <p>No hay reservaciones disponibles</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="border p-4 rounded">
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => handleConfirm(reservation.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => handleCancel(reservation.id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(reservation.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationList;
