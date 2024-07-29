import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa'; 
import roomService from '../services/roomService';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/rooms/all'); 
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleEdit = (id) => {
    roomService.updateRoom(id)
  };

  const handleDelete = (id) => {
    roomService.deleteRoom(id)
  };

  return (
    <div className="flex flex-col space-y-1">
      {rooms.map(room => (
        <div key={room.id} className="flex border border-gray-300 p-4">
          <div className="w-1/6 p-2">{room.id}</div>
          <div className="w-1/6 p-2">{room.description}</div>
          <div className="w-1/6 p-2">{room.typeRoom}</div>
          <div className="w-1/6 p-2">{room.detailRoom}</div>
          <div className="w-1/6 p-2">{room.status}</div>
          <div className="w-1/12 p-2 flex items-center justify-center">
            <button 
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              onClick={() => handleEdit(room.id)}
            >
              <FaEdit className="text-blue-600 text-lg" />
            </button>
          </div>
          <div className="w-1/12 p-2 flex items-center justify-center">
            <button 
              className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              onClick={() => handleDelete(room.id)}
            >
              <FaTrash className="text-red-500 text-lg" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
