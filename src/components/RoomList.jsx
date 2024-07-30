import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import roomService from '../services/roomService';
import Modal from './Modal';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    typeRoom: '',
    detailRoom: '',
    price: '',
    photo: '',
    status: '',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getRooms();
        setRooms(response);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleEdit = async (id) => {
    try {
      const room = await roomService.getRoom(id);
      setSelectedRoom(room);
      setFormData({
        description: room.description,
        typeRoom: room.typeRoom,
        detailRoom: room.detailRoom,
        price: room.price,
        photo: room.photo,
        status: room.status,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      try {
        await roomService.deleteRoom(id);
        const updatedRooms = await roomService.getRooms();
        setRooms(updatedRooms);
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomService.updateRoom(selectedRoom.id, formData);
      const updatedRooms = await roomService.getRooms();
      setRooms(updatedRooms);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating room:', error);
    }
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
              <FaTrash className="text-red-600 text-lg" />
            </button>
          </div>
        </div>
      ))}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <h2 className="text-lg font-semibold mb-4">Editar Habitación</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Descripción</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tipo de Habitación</label>
              <input
                type="text"
                name="typeRoom"
                value={formData.typeRoom}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Detalle</label>
              <input
                type="text"
                name="detailRoom"
                value={formData.detailRoom}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Precio</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Foto</label>
              <input
                type="text"
                name="photo"
                value={formData.photo}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              >
                <option value="available">Disponible</option>
                <option value="unavailable">No Disponible</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RoomList;
