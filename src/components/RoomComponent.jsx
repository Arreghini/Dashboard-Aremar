// src/components/RoomComponent.jsx
import React, { useEffect, useState } from 'react';
import roomService from '../services/roomService';
import useAuthToken from '../hooks/useAuthToken';

const RoomComponent = () => {
  const { getToken } = useAuthToken();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = await getToken();
        const roomsData = await roomService.getRooms(token);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error al obtener las habitaciones:', error);
      }
    };

    fetchRooms();
  }, [getToken]);

  return (
    <div>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>{room.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoomComponent;
