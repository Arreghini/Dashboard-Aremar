import React, { useEffect, useState } from 'react';
import reservationService from '../services/reservationService';

const ReservationList = ({ onEdit, onDelete }) => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const data = await reservationService.getReservations();
      setReservations(data);
    };
    fetchReservations();
  }, []);

  const handleDelete = async (reservationId) => {
    await reservationService.deleteReservation(reservationId);
    onDelete();
  };

  return (
    <div>
      {reservations.map((reservation) => (
        <div key={reservation.id} className="flex justify-between items-center my-2">
          <span>{reservation.guestName} - {reservation.roomId}</span>
          <div>
            <button onClick={() => onEdit(reservation)} className="mx-1">Editar</button>
            <button onClick={() => handleDelete(reservation.id)} className="mx-1">Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationList;
