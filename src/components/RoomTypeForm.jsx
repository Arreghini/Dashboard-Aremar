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
  const [existingPhotos, setExistingPhotos] = useState([]); // Para URLs existentes
  const [newPhotos, setNewPhotos] = useState([]); // Para archivos nuevos

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
  setError('');
  setSuccessMessage('');

  try {
    const token = await getAccessTokenSilently();
    
    // ✅ Crear FormData con TODOS los datos
    const formData = new FormData();
    
    // Agregar todos los campos del formulario
    formData.append('name', roomTypeData.name);
    formData.append('simpleBeds', roomTypeData.simpleBeds || '0');
    formData.append('trundleBeds', roomTypeData.trundleBeds || '0');
    formData.append('kingBeds', roomTypeData.kingBeds || '0');
    formData.append('windows', roomTypeData.windows || '0');
    formData.append('price', roomTypeData.price || '0');
    
    // Agregar fotos existentes como JSON string
    if (existingPhotos.length > 0) {
      formData.append('existingPhotos', JSON.stringify(existingPhotos));
    }
    
    // Agregar archivos nuevos
    if (newPhotos && newPhotos.length > 0) {
      newPhotos.forEach(file => {
        formData.append('photos', file);
      });
    }
    
    // ✅ Una sola llamada que incluye todo
    let response;
    if (roomTypeId) {
      response = await roomClasifyService.updateRoomTypeWithFiles(roomTypeId, formData, token);
    } else {
      response = await roomClasifyService.createRoomTypeWithFiles(formData, token);
    }
    
    setSuccessMessage(roomTypeId ? 'Tipo actualizado con éxito' : 'Tipo creado con éxito');
    resetForm();
    await loadRoomTypes(token);
    
    if (onRoomTypeCreated) {
      onRoomTypeCreated();
    }
    
  } catch (error) {
    console.error('Error:', error);
    setError(`Error: ${error.response?.data?.message || error.message}`);
  }
};
  const handleDelete = async (roomTypeId) => {
    if (!roomTypeId) {
      setError('ID no válido');
      return;
    }
    
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomType(roomTypeId, token);
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
      await loadRoomTypes(token);
      if (onRoomTypeCreated) onRoomTypeCreated();
    } catch (error) {
      setError(`Error al eliminar: ${error.response?.status}`);
    }
  };
  const handleEdit = (roomTypeId, roomTypeData) => {
    setRoomTypeId(roomTypeId);
    setExistingPhotos(roomTypeData.photos || []);
    setNewPhotos([]);
    setRoomTypeData({
      name: roomTypeData.name || '',
      photos: [], // Limpiar el input de archivos
      simpleBeds: roomTypeData.simpleBeds?.toString() || '',
      trundleBeds: roomTypeData.trundleBeds?.toString() || '',
      kingBeds: roomTypeData.kingBeds?.toString() || '',
      windows: roomTypeData.windows?.toString() || '',
      price: roomTypeData.price?.toString() || '',
    });
  };
  
  const loadRoomTypes = async (token) => {
    try {
      console.log('Cargando tipos de habitación...');
      const fetchedRoomTypes = await roomClasifyService.getRoomType(token);
      console.log('Tipos cargados exitosamente:', fetchedRoomTypes);
      setRoomTypes(fetchedRoomTypes);
    } catch (error) {
      console.error('Error al cargar los tipos de habitación:', error);
      // No lanzar el error, solo loguearlo
      // setError('Error al cargar los tipos de habitación');
    }
  };

  const resetForm = () => {
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
    setExistingPhotos([]);
    setNewPhotos([]);
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">
        {roomTypeId ? 'Actualizar Tipo de Habitación' : 'Crear Tipo de Habitación'}
      </h1>
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
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewPhotos(Array.from(e.target.files))}
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
        {roomTypes.map((item) => {
          console.log('Tipo de habitación:', item); // Depuración
          return (
            <li key={item.id} className="flex justify-between items-center border-b border-gray-300 p-2">
              <span>{item.name}</span>
              <div>
                <button onClick={() => handleEdit(item.id, item)} className="text-blue-500 mr-2">
                  Editar
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500">
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RoomTypeForm;
