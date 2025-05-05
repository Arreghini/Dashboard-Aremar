import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms/admin';

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
      // Convertimos explícitamente el precio a número
      const price = Number(roomTypeData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('El precio debe ser un número válido mayor que 0');
      }

      const data = {
        roomType: roomTypeData.roomType,
        photos: roomTypeData.photos,
        simpleBeds: Number(roomTypeData.simpleBeds),
        trundleBeds: Number(roomTypeData.trundleBeds),
        kingBeds: Number(roomTypeData.kingBeds),
        windows: Number(roomTypeData.windows),
        price: price
      };

      const response = await axios.post(`${BASE_URL}/roomType`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.log('Datos enviados:', roomTypeData);
      throw error;
    }
},
createRoomDetail: async (roomDetailData, token) => {
  try {
    const response = await axios.post(`${BASE_URL}/roomDetail`, roomDetailData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Detalle de habitación creado exitosamente');
    return response;
  } catch (error) {
    console.log('Datos enviados:', roomDetailData);
    throw error;
  }
},

  updateRoomType: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/roomType/${id}`, roomData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Tipo de habitación actualizado exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el tipo de habitación:', error);
      throw error;
    }
  },

  updateRoomDetail: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/roomDetail/${id}`, roomData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Detalles de la habitación actualizados exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar los detalles de la habitación:', error);
      throw error;
    }
  },
  
  deleteRoomType: async (id, token) => {
    try {
      if (!id) {
        throw new Error('ID no proporcionado');
      }
  
      // Usamos la ruta correcta del backend
      const url = `${BASE_URL}/roomType/${id}`;
      
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Respuesta del servidor:', response);
      
      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Tipo de habitación eliminado correctamente',
          id: id,
          data: response.data
        };
      }
      
    } catch (error) {
      console.error('Error completo:', error.response || error);
      throw new Error(`Error al eliminar: ${error.response?.data?.message || error.message}`);
    }
  },  
  
  deleteRoomDetail: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/roomDetail/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Detalles de la habitación eliminados exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar los detalles de la habitación:', error);
      throw error;
    }
  }
};

export default roomClasifyService;
