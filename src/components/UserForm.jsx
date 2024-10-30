import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';  
import userService from '../services/userService';

const UserForm = () => {
  const { getAccessTokenSilently } = useAuth0();  // Usa Auth0 para obtener el token de acceso
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    emailVerified: '',
    picture: '',
    phone: '',  
    dni: '',
    address: '',
    isActive: true,    
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  

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
      const token = await getAccessTokenSilently();
      await userService.createUser(formData, token);

      // Reinicia el formulario después de la creación
      setFormData({
        id: '',
        name: '',
        email: '',
        emailVerified: '',
        picture: '',
        phone: '',  
        dni: '',
        address: '',
        isActive: true,   
      });
      setError('');  // Limpia cualquier error anterior
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('User with this id already exists.');
      } else {
        setError('Error creating user.');
      }
      console.error('Error creando el usuario:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New User</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        email:
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        emailVerified:
        <input
          type="boolean"
          name="emailVerified"
          value={formData.emailVerified}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        picture:
        <input
          type="text"
          name="picture"
          value={formData.picture}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        phone:
        <input
          type="text"
          name="phone"
          value= {formData.phone}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        dni:
        <input
          type="text"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        address:
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />        
      </label>
      <label>
        isActive:
        <input
          type="boolean"
          name="isActive"
          value={formData.isActive}
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

export default UserForm;
