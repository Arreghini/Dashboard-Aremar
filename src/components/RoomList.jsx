import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';  
import roomService from '../services/roomService';
import Modal from './Modal';

const RoomList = () => {
  const { getAccessTokenSilently } = useAuth0();  
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    typeRoom: '',
    detailRoom: '',
    price: '',
    photoRoom: '',  
    status: '',
  });

  const fetchRooms = async () => {
    try {
      const roomsData = await roomService.getRooms();
      console.log('Datos de habitaciones recibidos:', roomsData);
      if (Array.isArray(roomsData) && roomsData.length > 0) {
        setRooms(roomsData);
      } else {
        console.log('No se encontraron habitaciones o los datos no son un array');
        setRooms([]);
      }
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      setRooms([]);
    }
  };
  

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const room = await roomService.getRoom(id, token);
      setSelectedRoom(room);
      setFormData({
        description: room.description,
        typeRoom: room.typeRoom,
        detailRoom: room.detailRoom,
        price: room.price,
        photoRoom: room.photoRoom,  
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
        const token = await getAccessTokenSilently();
        await roomService.deleteRoom(id, token);
        fetchRooms();  // Recargar lista tras borrar
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
      const token = await getAccessTokenSilently();
      if (selectedRoom) {
        await roomService.updateRoom(selectedRoom.id, formData, token);
      } else {
        await roomService.createRoom(formData, token);
      }
      fetchRooms();  // Recargar lista tras editar/crear
      handleCloseModal();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Habitaciones</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-300">Descripción</th>
            <th className="py-2 px-4 border-b border-gray-300">Tipo</th>
            <th className="py-2 px-4 border-b border-gray-300">Detalles</th>
            <th className="py-2 px-4 border-b border-gray-300">Precio</th>
            <th className="py-2 px-4 border-b border-gray-300">Foto</th>
            <th className="py-2 px-4 border-b border-gray-300">Estado</th>
            <th className="py-2 px-4 border-b border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="py-2 px-4 border-b border-gray-300">{room.description}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.typeRoom}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.detailRoom}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.price}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.photo}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.status}</td>
              <td className="py-2 px-4 border-b border-gray-300">
                <button
                  onClick={() => handleEdit(room.id)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="description">Descripción</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label htmlFor="typeRoom">Tipo de Habitación</label>
              <input
                type="text"
                id="typeRoom"
                name="typeRoom"
                value={formData.typeRoom}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label htmlFor="detailRoom">Detalles</label>
              <input
                type="text"
                id="detailRoom"
                name="detailRoom"
                value={formData.detailRoom}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label htmlFor="price">Precio</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label htmlFor="photo">Foto</label>
              <input
                type="text"
                id="photo"
                name="photo"
                value={formData.photo}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label htmlFor="status">Estado</label>
              <input
                type="text"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              />
            </div>
            <button type="submit" className="mt-4">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RoomList;
