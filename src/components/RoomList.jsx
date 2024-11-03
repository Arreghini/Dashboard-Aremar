import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import roomService from '../services/roomService';
import Modal from './Modal';
import RoomForm from './RoomForm';

const RoomList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRooms = async () => {
    try {
      const roomsData = await roomService.getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      setErrorMessage('No se pudieron cargar las habitaciones.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = (room) => {
    setFormData(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSave = () => {
    fetchRooms();  // Refresca la lista después de guardar
    handleModalClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Habitaciones</h2>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <button onClick={() => handleEdit({})} className="mb-2">
        Crear Habitación
      </button>
      <div>
        {rooms.map((room) => (
          <div key={room.id} className="mb-2">
            <span>{room.description}</span>
            <button onClick={() => handleEdit(room)}><FaEdit /></button>
            <button onClick={() => handleDelete(room.id)}><FaTrash /></button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <Modal onClose={handleModalClose}>
          <RoomForm room={formData} onSave={handleSave} />
        </Modal>
      )}
    </div>
  );
};

export default RoomList;
