import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomTypeForm = ({ onRoomTypeCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomType, setRoomType] = useState('');
  const [roomTypeId, setRoomTypeId] = useState(null); // Estado para el ID del tipo de habitación a editar
  const [roomTypes, setRoomTypes] = useState([]); // Estado para la lista de tipos de habitación
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar los tipos de habitación existentes al montar el componente
    const fetchRoomTypes = async () => {
      try {
        const fetchedRoomTypes = await roomClasifyService.getRoomType();
        setRoomTypes(fetchedRoomTypes);
      } catch (error) {
        console.error('Error al obtener los tipos de habitación:', error);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();

      if (roomTypeId) {
        // Si hay un ID, estamos actualizando un tipo de habitación existente
        await roomClasifyService.updateRoomType(roomTypeId, { type: roomType }, token);
        setSuccessMessage('Tipo de habitación actualizado con éxito');
      } else {
        // Si no hay ID, estamos creando un nuevo tipo de habitación
        await roomClasifyService.createRoomType({ type: roomType }, token);
        setSuccessMessage('Tipo de habitación creado con éxito');
      }
      
      setRoomType('');
      setRoomTypeId(null);
      setError('');
      onRoomTypeCreated();
      loadRoomTypes(); // Refresca la lista de tipos de habitación después de crear o actualizar

    } catch (error) {
      setError('Error al guardar el tipo de habitación');
    }
  };

  const handleEdit = (id, typeText) => {
    setRoomTypeId(id);
    setRoomType(typeText);
  };

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomType(id, token);
      setSuccessMessage('Tipo de habitación eliminado con éxito');
      setRoomType('');
      setRoomTypeId(null);
      setError('');
      onRoomTypeCreated();
      loadRoomTypes(); // Refresca la lista de tipos de habitación después de eliminar
    } catch (error) {
      setError('Error al eliminar el tipo de habitación');
    }
  };

  const loadRoomTypes = async () => {
    const fetchedRoomTypes = await roomClasifyService.getRoomType();
    setRoomTypes(fetchedRoomTypes);
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{roomTypeId ? 'Actualizar' : 'Crear'} Tipo de Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          placeholder="Tipo de habitación"
          required
          className="border border-gray-300 p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          {roomTypeId ? 'Actualizar' : 'Crear'} Tipo
        </button>
      </form>
      <ul className="mt-4">
        {roomTypes.map((item) => (
          <li key={item.id} className="flex justify-between items-center border-b border-gray-300 p-2">
            <span>{item.type}</span>
            <div>
              <button onClick={() => handleEdit(item.id, item.type)} className="text-blue-500 mr-2">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomTypeForm;
