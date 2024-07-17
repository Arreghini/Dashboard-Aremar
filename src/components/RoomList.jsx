import React, { useEffect, useState } from 'react';
import roomService from '../services/roomService';

const RoomList = ({ onEdit, onDelete }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await roomService.getRooms();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  const handleDelete = async (roomId) => {
    await roomService.deleteRoom(roomId);
    onDelete();
  };

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id} className="flex justify-between items-center my-2">
          <span>{room.name} - {room.capacity}</span>
          <div>
            <button onClick={() => onEdit(room)} className="mx-1">Editar</button>
            <button onClick={() => handleDelete(room.id)} className="mx-1">Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
