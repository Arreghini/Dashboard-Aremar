import React, { useEffect, useState } from 'react';

function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Simulación de obtención de datos de un API
    fetchRooms().then(data => {
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        console.error('Rooms data is not an array:', data);
        setRooms([]);
      }
    }).catch(error => {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    });
  }, []);

  return (
    <div>
      <h2>Room List</h2>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>{room.name}</li>
        ))}
      </ul>
    </div>
  );
}

async function fetchRooms() {
  // Aquí deberías tener la lógica para obtener los datos de las habitaciones
  return [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' }
  ]; // Simulación de datos
}

export default RoomList;
