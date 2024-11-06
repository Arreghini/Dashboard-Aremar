import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms/admin';

const getHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const roomClasifyService = {
  getRoomType: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/roomType`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Respuesta del servidor (tipos):', response);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de habitación:', error);
      throw error;
    }
  },
  getRoomDetail: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/roomDetail`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Respuesta del servidor (detalles):', response);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los detalles de la habitación:', error);
      throw error;
    }
  },
createRoomType: async (roomTypeData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/roomType`, 
      roomTypeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('Respuesta crear tipo:', response);
    return response.data;
  } catch (error) {
    console.error('Error al crear el tipo de habitación:', error);
    throw error;
  }
},
createRoomDetail: async (roomDetailData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/roomDetail`, 
      roomDetailData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('Respuesta crear detalle:', response);
    return response.data;
  } catch (error) {
    console.error('Error al crear el detalle de la habitación:', error);
    throw error;
  }
},
  updateRoomType: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/roomType/${id}`, roomData, getHeaders(token));
      console.log('Tipo de habitación actualizado exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el tipo de habitación:', error);
      throw error;
    }
  },
  updateRoomDetail: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/roomDetail/${id}`, roomData, getHeaders(token));
      console.log('Detalles de la habitación actualizados exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar los detalles de la habitación:', error);
      throw error;
    }
  },
  deleteRoomType: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/roomType/${id}`, getHeaders(token));
      console.log('Tipo de habitación eliminado exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el tipo de habitación:', error);
      throw error;
    }
  },
  deleteRoomDetail: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/roomDetail/${id}`, getHeaders(token));
      console.log('Detalles de la habitación eliminados exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar los detalles de la habitación:', error);
      throw error;
    }
  }
};

export default roomClasifyService;
