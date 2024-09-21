import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';  // Importa Auth0
import roomService from '../services/roomService';

const RoomForm = () => {
  const { getAccessTokenSilently } = useAuth0();  // Usa Auth0 para obtener el token de acceso
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    typeRoom: '',
    detailRoom: '',
    price: '',
    photo: '',  // Consistencia con RoomList
    status: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Estado para gestionar la carga

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Indica que la solicitud está en proceso
    try {
      console.log('Obteniendo token...');
      const token = await getAccessTokenSilently();  // Obtén el token para autenticación
      console.log('Token recibido:', token);  // Verifica que el token se imprime en la consola

      await roomService.createRoom(formData, token);  // Llama al servicio para crear la habitación
      console.log('Habitación creada con éxito.');

      // Reinicia el formulario después de la creación
      setFormData({
        id: '',
        description: '',
        typeRoom: '',
        detailRoom: '',
        price: '',
        photo: '',
        status: '',
      });
      setError('');  // Limpia cualquier error anterior
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Room with this ID already exists.');
      } else {
        setError('Error creating room.');
      }
      console.error('Error creando la habitación:', error);
    } finally {
      setIsLoading(false);  // Detiene el estado de carga
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Room</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        Description:
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Type of Room:
        <input
          type="text"
          name="typeRoom"
          value={formData.typeRoom}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Details:
        <input
          type="text"
          name="detailRoom"
          value={formData.detailRoom}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Photo URL:
        <input
          type="text"
          name="photo"
          value={formData.photo}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Status:
        <input
          type="text"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        />
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Room'}
      </button>
    </form>
  );
};

export default RoomForm;
