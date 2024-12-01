import { useState, useEffect } from 'react';
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
    price: '',
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
  
      // Aseguramos que el precio sea un número válido
      const roomTypePayload = {
        name: roomTypeData.name,
        photos: Array.isArray(roomTypeData.photos) ? roomTypeData.photos : [],
        simpleBeds: Number(roomTypeData.simpleBeds || 0),
        trundleBeds: Number(roomTypeData.trundleBeds || 0),
        kingBeds: Number(roomTypeData.kingBeds || 0),
        windows: Number(roomTypeData.windows || 0),
        price: Number(roomTypeData.price || 0),
      };
  
      // Validación del precio
      if (!roomTypePayload.price || roomTypePayload.price <= 0) {
        setError('El precio es requerido y debe ser mayor que 0');
        return;
      }
  
      if (roomTypeId) {
        await roomClasifyService.updateRoomType(roomTypeId, roomTypePayload, token);
      } else {
        await roomClasifyService.createRoomType(roomTypePayload, token);
      }
  
      // Mensaje de éxito
      setSuccessMessage('Tipo de habitación creado con éxito');
  
      // Resetear el formulario
      setRoomTypeData({
        name: '',
        photos: [],
        simpleBeds: '',
        trundleBeds: '',
        kingBeds: '',
        windows: '',
        price: '',
      });
      setRoomTypeId(null);
      setError('');
      loadRoomTypes(token);
  
      if (onRoomTypeCreated) onRoomTypeCreated();
    } catch (error) {
      console.error('Error al guardar el tipo de habitación:', error);
      setError('Error al guardar el tipo de habitación');
    }
  };  

  const handleDelete = async (id) => {
    if (!id) {
      setError('ID no válido');
      return;
    }
    
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomType(id, token);
      await loadRoomTypes(token);
      setSuccessMessage('Tipo de habitación eliminado con éxito');
      setRoomTypeData({
        name: '',
        photos: [],
        simpleBeds: '',
        trundleBeds: '',
        kingBeds: '',
        windows: '',
        price: '',
      });
      setRoomTypeId(null);
      setError('');
      loadRoomTypes(token);
      if (onRoomTypeCreated) onRoomTypeCreated();
    } catch (error) {
      setError(`Error al eliminar: ${error.response?.status}`);
    }
  };
  
  const handleEdit = (id, roomType) => {
    setRoomTypeId(id);
    setRoomTypeData({
      name: roomType.name,
      photos: roomType.photos || [],
      simpleBeds: roomType.simpleBeds?.toString() || '0',
      trundleBeds: roomType.trundleBeds?.toString() || '0',
      kingBeds: roomType.kingBeds?.toString() || '0',
      windows: roomType.windows?.toString() || '0',
      price: roomType.price?.toString() || '0',
    });
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
          onChange={(e) => setRoomTypeData({ ...roomTypeData, simpleBeds: e.target.value })}
          placeholder="Número de camas simples"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.trundleBeds}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, trundleBeds: e.target.value })}
          placeholder="Número de camas nido"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.kingBeds}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, kingBeds: e.target.value })}
          placeholder="Número de camas king"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="number"
          value={roomTypeData.windows}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, windows: e.target.value })}
          placeholder="Número de ventanas"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="text"
          value={roomTypeData.photos.join(', ')}
          onChange={(e) => setRoomTypeData({ ...roomTypeData, photos: e.target.value.split(',').map(photo => photo.trim()) })}
          placeholder="URLs de fotos (separadas por comas)"
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
        type="number"
        value={roomTypeData.price}
        onChange={(e) => setRoomTypeData({ ...roomTypeData, price: e.target.value })}
        placeholder="Precio diario"
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
