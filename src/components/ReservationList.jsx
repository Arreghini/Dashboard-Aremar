import React, { useEffect, useState } from 'react';
import reservationService from '../services/reservationService';

const ReservationList = ({ onEdit, onDelete }) => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const data = await reservationService.getReservations();
    setReservations(data);
  };

  const handleConfirm = async (reservationId) => {
    await reservationService.confirmReservation(reservationId);
    fetchReservations();
  };

  const handleCancel = async (reservationId) => {
    await reservationService.cancelReservation(reservationId);
    fetchReservations();
  };

  const handleDelete = async (reservationId) => {
    await reservationService.deleteReservation(reservationId);
    fetchReservations();
  };

  return (
    <div>
      {reservations.map((reservation) => (
        <div key={reservation.id} className="flex justify-between items-center my-2">
          <span>{reservation.guestName} - {reservation.roomId} - Estado: {reservation.status}</span>
          <div>
            <button onClick={() => onEdit(reservation)} className="mx-1">Editar</button>
            <button onClick={() => handleDelete(reservation.id)} className="mx-1">Eliminar</button>
            {reservation.status === 'pending' && (
              <>
                <button onClick={() => handleConfirm(reservation.id)} className="mx-1">Confirmar</button>
                <button onClick={() => handleCancel(reservation.id)} className="mx-1">Cancelar</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationList;
