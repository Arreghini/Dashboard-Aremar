import React, { useEffect, useState } from 'react';

function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // Simulación de obtención de datos de un API
    fetchReservations().then(data => {
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error('Reservations data is not an array:', data);
        setReservations([]);
      }
    }).catch(error => {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    });
  }, []);

  return (
    <div>
      <h2>Reservation List</h2>
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.id}>{reservation.name}</li>
        ))}
      </ul>
    </div>
  );
}

async function fetchReservations() {
  // Aquí deberías tener la lógica para obtener los datos de las reservas
  return [
    { id: 1, name: 'Reservation 1' },
    { id: 2, name: 'Reservation 2' }
  ]; // Simulación de datos
}

export default ReservationList;
