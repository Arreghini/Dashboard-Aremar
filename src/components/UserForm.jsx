import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import userService from '../services/userService';

const UserForm = () => {
  const { getAccessTokenSilently } = useAuth0(); // Usa Auth0 para obtener el token de acceso
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    emailVerified: false, // Cambiado a booleano
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value, // Actualiza booleanos correctamente
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('formData:', formData);
    try {
      const token = await getAccessTokenSilently();
      await userService.createUser(formData, token);

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
      setError('');
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
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Email Verified:
        <input
          type="checkbox"
          name="emailVerified"
          checked={formData.emailVerified} // Usa checked para checkbox
          onChange={handleChange}
        />
      </label>
      <label>
        Picture:
        <input
          type="text"
          name="picture"
          value={formData.picture}
          onChange={handleChange}
        />
      </label>
      <label>
        Phone:
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </label>
      <label>
        DNI:
        <input
          type="text"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
        />
      </label>
      <label>
        Address:
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </label>
      <label>
        Is Active:
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive} // Usa checked para checkbox
          onChange={handleChange}
        />
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;
