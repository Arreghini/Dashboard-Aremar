import React, { useState } from 'react';
import roomService from '../services/roomService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomForm = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    roomType: '',
    detailRoom: '',
    price: '',
    photoRoom: '',
    status: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      
      // Restablecer el formulario después de una creación exitosa
      setFormData({
        id: '',
        description: '',
        roomType: '',
        detailRoom: '',
        price: '',
        photoRoom: '',
        status: '',
      });

      setError(''); // Limpiar errores previos
      setSuccessMessage('Habitación creada con éxito'); // Mensaje de éxito
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error === 'Room with this ID already exists') {
        setError('Ya existe una habitación con este ID. Por favor, elige un ID diferente.');
      } else {
        setError('Error al crear la habitación. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">Crear Nueva Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <label className="block mb-2">
        ID:
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
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Tipo de Habitación:
        <input
          type="text"
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Detalles:
        <input
          type="text"
          name="detailRoom"
          value={formData.detailRoom}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Precio:
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        URL de la Foto:
        <input
          type="text"
          name="photoRoom"
          value={formData.photoRoom}
          onChange={handleChange}
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
          <option value="">Seleccionar estado</option>
          <option value="available">Disponible</option>
          <option value="unavailable">No disponible</option>
        </select>
      </label>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Crear Habitación
      </button>
    </form>
  );
};

export default RoomForm;
