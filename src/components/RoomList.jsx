import { useEffect, useState } from 'react';
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
      const token = await getAccessTokenSilently();
      const roomsData = await roomService.getRooms(token);
      const roomsWithPhotoArray = roomsData.map(room => ({
        ...room,
        photoRoom: room.photoRoom || []
      }));
      setRooms(roomsWithPhotoArray);
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      setErrorMessage('No se pudieron cargar las habitaciones.');
    }
  };
  
  useEffect(() => {
    fetchRooms();
  }, [getAccessTokenSilently]);

  const handleEdit = async (room) => {
    try {
        const token = await getAccessTokenSilently();
        if (room.id) {
            setFormData(room); // Usamos directamente los datos que ya tenemos
            setIsModalOpen(true);
        } else {
            setFormData({});
            setIsModalOpen(true);
        }
    } catch (error) {
        setErrorMessage('Error al cargar los datos de la habitación');
    }
};

const handleSave = async (roomData) => {
    try {
        const token = await getAccessTokenSilently();
        if (roomData.id) {
            await roomService.updateRoom(roomData.id, roomData, token);
            setSuccessMessage('Habitación actualizada exitosamente');
        } else {
            await roomService.createRoom(roomData, token);
            setSuccessMessage('Habitación creada exitosamente');
        }
        await fetchRooms();
        handleModalClose();
    } catch (error) {
        setErrorMessage(error.message || 'Error al guardar la habitación');
    }
};

  const handleDelete = async (roomId) => {
    try {
      const token = await getAccessTokenSilently();
      await roomService.deleteRoom(roomId, token);
      setSuccessMessage('Habitación eliminada con éxito.');
      fetchRooms();
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      setErrorMessage('No se pudo eliminar la habitación.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Habitaciones</h2>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
      <button onClick={() => handleEdit({})} className="mb-2 bg-blue-500 text-white px-4 py-2 rounded">
        Crear Habitación
      </button>
      <div>
      {rooms.map((room) => (
  <div key={room.id} className="flex justify-between items-center mb-2 border-b pb-2">
    <span>{room.description}</span>
    <div className="flex space-x-2">
      {room?.photoRoom && Array.isArray(room.photoRoom) && room.photoRoom.length > 0 ? (
        room.photoRoom.map((photo, index) => (
          <img 
            key={index} 
            src={photo} 
            alt={`Room ${room.id} - ${index}`} 
            className="w-20 h-20 object-cover" 
          />
        ))
      ) : (
        <span>No hay imágenes disponibles</span>
      )}
    </div>
    <div className="flex space-x-2">
      <button onClick={() => handleEdit(room)} className="text-blue-500">
        <FaEdit />
      </button>
      <button onClick={() => handleDelete(room.id)} className="text-red-500">
        <FaTrash />
      </button>
    </div>
  </div>
))}

      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
      >
        <RoomForm 
          room={formData} 
          onSave={handleSave} 
          key={formData?.id || 'new'}
        />
      </Modal>
    </div>
  );
};

export default RoomList;
