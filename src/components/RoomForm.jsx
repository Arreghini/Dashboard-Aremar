import React, { useState, useEffect } from 'react';
import roomService from '../services/roomService';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const types = await roomService.getRoomTypes();
        const details = await roomService.getRoomDetails();
        setRoomTypes(types);
        setRoomDetails(details);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room types or details:', error);
        setError('Error al cargar tipos o detalles de habitación');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        Tipo de Habitación:
        <select
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        >
          <option value="">Selecciona un tipo</option>
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.type}</option>
          ))}
        </select>
      </label>
      <label className="block mb-2">
        Detalle de Habitación:
        <select
          name="detailRoom"
          value={formData.detailRoom}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        >
          <option value="">Selecciona un detalle</option>
          {roomDetails.map((detail) => (
            <option key={detail.id} value={detail.id}>{detail.detail}</option>
          ))}
        </select>
      </label>
      {/* Otros campos del formulario */}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Crear Habitación
      </button>
    </form>
  );
};

export default RoomForm;
