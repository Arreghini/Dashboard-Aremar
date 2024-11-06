import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomTypeForm = ({ onRoomTypeCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomTypeData, setRoomTypeData] = useState({
    name: '',
    photos: [],
    simpleBeds: '',
    trundleBeds: '',
    kingBeds: '',
    windows: '',
  });  
  const [roomTypeId, setRoomTypeId] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = await getAccessTokenSilently();
        const fetchedRoomTypes = await roomClasifyService.getRoomType(token);
        setRoomTypes(fetchedRoomTypes);
      } catch (error) {
        console.error('Error al obtener los tipos de habitación:', error);
      }
    };
    fetchRoomTypes();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const roomTypePayload = { ...roomTypeData };

      if (roomTypeId) {
        await roomClasifyService.updateRoomType(roomTypeId, roomTypePayload, token);
        setSuccessMessage('Tipo de habitación actualizado con éxito');
      } else {
        await roomClasifyService.createRoomType(roomTypePayload, token);
        setSuccessMessage('Tipo de habitación creado con éxito');
      }

      // Resetear el formulario
      setRoomTypeData({
        name: '',
        photos: [],
        simpleBeds: '',
        trundleBeds: '',
        kingBeds: '',
        windows: '',
      });
      setRoomTypeId(null);
      setError('');
      loadRoomTypes(token); // Refresca la lista con el token válido

      if (onRoomTypeCreated) onRoomTypeCreated(); // Llama al callback si está definido
    } catch (error) {
      console.error('Error al guardar el tipo de habitación:', error);
      setError('Error al guardar el tipo de habitación');
    }
  };

  const handleEdit = (id, roomType) => {
    setRoomTypeId(id);
    setRoomTypeData(roomType); // Asigna el objeto completo del tipo de habitación
  };

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomType(id, token);
      setSuccessMessage('Tipo de habitación eliminado con éxito');
      setRoomTypeData({
        name: '',
        photos: [],
        simpleBeds: '',
        trundleBeds: '',
        kingBeds: '',
        windows: '',
      });
      setRoomTypeId(null);
      setError('');
      loadRoomTypes(token); // Refresca la lista con el token válido
    } catch (error) {
      console.error('Error al eliminar el tipo de habitación:', error);
      setError('Error al eliminar el tipo de habitación');
    }
  };

  const loadRoomTypes = async (token) => {
    try {
      const fetchedRoomTypes = await roomClasifyService.getRoomType(token);
      setRoomTypes(fetchedRoomTypes);
    } catch (error) {
      console.error('Error al cargar los tipos de habitación:', error);
      setError('Error al cargar los tipos de habitación');
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{roomTypeId ? 'Actualizar' : 'Crear'} Tipo de Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={roomTypeData.name}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, name: e.target.value })}
          placeholder="Nombre del tipo de habitación"
          required
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.simpleBeds}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, simpleBeds: Number(e.target.value) })}
          placeholder="Número de camas simples"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.trundleBeds}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, trundleBeds: Number(e.target.value) })}
          placeholder="Número de camas nido"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.kingBeds}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, kingBeds: Number(e.target.value) })}
          placeholder="Número de camas king"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.windows}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, windows: Number(e.target.value) })}
          placeholder="Número de ventanas"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="text"
          value={roomTypeData.photos.join(', ')} // Puedes manejar esto según cómo quieras gestionar las fotos
          onChange={(e) => setRoomTypeData({ ...roomTypeData, photos: e.target.value.split(',').map(photo => photo.trim()) })}
          placeholder="URLs de fotos (separadas por comas)"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          {roomTypeId ? 'Actualizar' : 'Crear'} Tipo
        </button>
      </form>
      <ul className="mt-4">
        {roomTypes.map((item) => (
          <li key={item.id} className="flex justify-between items-center border-b border-gray-300 p-2">
            <span>{item.name}</span>
            <div>
              <button onClick={() => handleEdit(item.id, item)} className="text-blue-500 mr-2">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomTypeForm;
