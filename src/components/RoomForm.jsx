
import React, { useState } from 'react';
import roomService from '../services/roomService';
import { useAuth0 } from '@auth0/auth0-react';  

const RoomForm = () => {
  const { getAccessTokenSilently } = useAuth0();  
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    typeRoom: '',
    detailRoom: '',
    price: '',
    photoRoom: '',
    status: '',
  });
  const [error, setError] = useState('');

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
        typeRoom: '',
        detailRoom: '',
        price: '',
        photoRoom: '',
        status: '',
      });
      
      setError(''); // Limpiar errores previos
      console.log('Habitación creada con éxito');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error === 'Room with this ID already exists') {
        setError('Ya existe una habitación con este ID. Por favor, elige un ID diferente.');
      } else {
        setError('Error al crear la habitación. Por favor, intenta de nuevo.');
      }
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Room</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        ID:
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Description:
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </label>
      <label>
        Type Room:
        <input
          type="text"
          name="typeRoom"
          value={formData.typeRoom}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Detail Room:
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
        Photo Room:
        <input
          type="text"
          name="photoRoom"
          value={formData.photoRoom}
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
      <button type="submit">Create Room</button>
    </form>
  );
};

export default RoomForm;
