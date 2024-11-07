import { useState, useEffect } from 'react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomForm = ({ room = {}, onSave }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    id: room.id || '',
    description: room.description || '',
    roomType: room.roomType || '',
    detailRoom: room.detailRoom || '',
    price: room.price || '',
    photoRoom: room.photoRoom || '',
    status: room.status || '',
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomDetails, setRoomDetails] = useState([]);
  const [loading, setLoading] = useState(true);  // Indicador de carga
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

 // Modificar el useEffect donde se obtienen los datos
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = await getAccessTokenSilently();
      const types = await roomClasifyService.getRoomType(token);
      const details = await roomClasifyService.getRoomDetail(token);
      setRoomTypes(types); 
      setRoomDetails(details); 
      setLoading(false);
    } catch (error) {
      setError('Error al cargar datos');
      setLoading(false);
    }
  };
  fetchData();
}, [getAccessTokenSilently]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await roomService.createRoom(formData, token);
      setSuccessMessage('Habitación creada con éxito');
      onSave();  // Para refrescar la lista en `RoomList`
      setFormData({
        id: '',
        description: '',
        roomType: '',
        detailRoom: '',
        price: '',
        photoRoom: '',
        status: '',
      });
      setError('');
    } catch (error) {
      console.error('Error al crear la habitación:', error);
      setError('Error al crear la habitación');
    }
  };

  if (loading) {
    return <p>Cargando tipos y detalles de habitación...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">Crear Nueva Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <label className="block mb-2">
      Id:
      <input
      type="text"
      name="id"
      value={formData.id}
      onChange={handleChange}
      required
      className="border border-gray-300 p-2 w-full"
      />
      </label>
      <label className="block mb-2">
      Descripción: 
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        className="border border-gray-300 p-2 w-full"
      />
    </label>
    <select
  name="roomType"
  value={formData.roomType}
  onChange={handleChange}
  required
  className="border border-gray-300 p-2 w-full"
>
  <option value="">Selecciona un tipo</option>
  {roomTypes && roomTypes.length > 0 && roomTypes.map((type) => (
    <option key={type.id} value={type.id}>
      {type.name || type.type || type.description}
    </option>
  ))}
</select>

<select
  name="detailRoom"
  value={formData.detailRoom}
  onChange={handleChange}
  required
  className="border border-gray-300 p-2 w-full"
>
  <option value="">Selecciona un detalle</option>
  {roomDetails && roomDetails.length > 0 && roomDetails.map((detail) => (
    <option key={detail.id} value={detail.id}>
      {detail.name || detail.detail || detail.description}
    </option>
  ))}
</select>
<label className="block mb-2">
  Precio:
  <input
    type="text"
    name="price"
    value={formData.price}
    onChange={handleChange}
    required
    className="border border-gray-300 p-2 w-full"
  />
</label>
<label className="block mb-2">
  Foto:
  <input
    type="file"
    name="photoRoom"
    onChange={(e) => setFormData({...formData, photoRoom: e.target.files[0] })}
    required
    className="border border-gray-300 p-2 w-full"
  />
</label>
<label className="block mb-2">
  Estado:
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    required
    className="border border-gray-300 p-2 w-full"
  >
    <option value="">Selecciona un estado</option>
    <option value="Disponible">Disponible</option>
    <option value="Ocupado">Ocupado</option>
    <option value="Mantenimiento">Mantenimiento</option>
  </select>
</label>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Crear Habitación
      </button>
    </form>
  );
};

export default RoomForm;
