import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/users/admin';

const getHeaders = (token) => {
  console.log('Token recibido:', token);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const userService = { 
  getUser: async (id,token) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, getHeaders(token));
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error al obtener el usuario:', error);
    throw error;
  }  
},
 getUsers: async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/all`,getHeaders(token));
    console.log('Respuesta del servidor:',response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.log('La respuesta no es un array de usuarios');
      return [];
    }
  }catch (error) {
    console.log('Error al obtener los usuarios:', error);
    throw error;
    }
  },
 createUser: async (userData, token) => {
  try {
    const response = await axios.post(`${BASE_URL}`, userData, getHeaders(token));
    console.log('Usuario creado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
},
 updateUser: async (id, userData, token) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`,userData, getHeaders(token));
    console.log('Usuario actualizado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
},
 deleteUser: async (id, token) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`,getHeaders(token)); 
    console.log('Usuario eliminado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
},
};

export default userService;
