import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';  
import roomService from '../services/roomService';
import Modal from './Modal'; 

const RoomList = () => {
  const { getAccessTokenSilently } = useAuth0();  
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
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
      setRooms(roomsData);
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = (room) => {
    console.log('Editando habitación:', room); // Verifica que el room se esté recibiendo
    setFormData(room); // Carga los datos de la habitación en el formulario
    setIsModalOpen(true); // Abre el modal
  };
  

  const handleModalClose = () => {
    setIsModalOpen(false); // Cierra el modal
    setFormData({ // Reinicia el estado del formulario
      id: '',
      description: '',
      typeRoom: '',
      detailRoom: '',
      price: '',
      photoRoom: '',  
      status: '',
    });
  }; 
  const handleUpdateRoom = async () => {
    try {
      const token = await getAccessTokenSilently();
      await roomService.updateRoom(formData.id, formData, token);
      fetchRooms(); // Recarga la lista de habitaciones
      handleModalClose(); // Cierra el modal
    } catch (error) {
      console.error('Error actualizando la habitación:', error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      try {
        const token = await getAccessTokenSilently(); // Obtiene el token aquí
        await roomService.deleteRoom(id, token); // Pasa el token aquí
        fetchRooms(); // Recarga la lista tras borrar
      } catch (error) {
        console.error('Error eliminando la habitación:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Habitaciones</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-300">ID</th>
            <th className="py-2 px-4 border-b border-gray-300">Descripción</th>
            <th className="py-2 px-4 border-b border-gray-300">Tipo</th>
            <th className="py-2 px-4 border-b border-gray-300">Detalles</th>
            <th className="py-2 px-4 border-b border-gray-300">Precio</th>
            <th className="py-2 px-4 border-b border-gray-300">Estado</th>
            <th className="py-2 px-4 border-b border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="py-2 px-4 border-b border-gray-300">{room.id}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.description}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.typeRoom}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.detailRoom}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.price}</td>
              <td className="py-2 px-4 border-b border-gray-300">{room.status}</td>
              <td className="py-2 px-4 border-b border-gray-300">

                <button onClick={() => handleEdit(room)} 
                className="text-blue-500 hover:text-blue-700 mr-2">
                <FaEdit />
                </button>

                <button onClick={() => handleDelete(room.id)}
                className="text-red-500 hover:text-red-700">
                <FaTrash />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para editar habitación */}
      {isModalOpen && (
  <Modal isOpen={isModalOpen} onClose={handleModalClose}>
    <h2 className="text-lg font-bold mb-4">Editar Habitación</h2>
    <form onSubmit={(e) => { e.preventDefault(); handleUpdateRoom(); }}>
            <input 
              type="text" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción" 
              className="mb-2 w-full"
              required 
            />
            <input 
              type="text" 
              value={formData.typeRoom} 
              onChange={(e) => setFormData({ ...formData, typeRoom: e.target.value })}
              placeholder="Tipo de habitación" 
              className="mb-2 w-full"
              required 
            />
            <input 
              type="text" 
              value={formData.detailRoom} 
              onChange={(e) => setFormData({ ...formData, detailRoom: e.target.value })}
              placeholder="Detalles" 
              className="mb-2 w-full"
            />
            <input 
              type="number" 
              value={formData.price} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Precio" 
              className="mb-2 w-full"
              required 
            />
            <input 
              type="text" 
              value={formData.photoRoom} 
              onChange={(e) => setFormData({ ...formData, photoRoom: e.target.value })}
              placeholder="URL de la foto" 
              className="mb-2 w-full"
            />
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mb-2 w-full"
              required
            >
              <option value="">Seleccionar estado</option>
              <option value="available">Disponible</option>
              <option value="unavailable">No disponible</option>
            </select>
            <button type="submit" className="bg-blue-500 text-white p-2">Actualizar</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RoomList;
