import axios from 'axios';

const apiUrl = 'http://localhost:3000/api';

const createUser = async (userData, token) => {
  try {
    const response = await axios.post(`${apiUrl}/users`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,  // Pasa el token como header
      },
    });
    console.log('Usuario creado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
};

const updateUser = async (id, userData, token) => {
  try {
    const response = await axios.put(`${apiUrl}/users/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,  // Pasa el token como header
      },
    });
    console.log('Usuario actualizado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
};

const getUsers = async (token) => {
  try {
    const response = await axios.get(`${apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Pasa el token como header
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    throw error;
  }
};

const deleteUser = async (id, token) => {
  try {
    const response = await axios.delete(`${apiUrl}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Pasa el token como header
      },
    });
    console.log('Usuario eliminado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};

const userService = { createUser, updateUser, getUsers, deleteUser };

export default userService;
