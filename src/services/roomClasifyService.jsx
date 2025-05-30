import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms/admin';

const roomClasifyService = {
getRoomTypes: async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/roomType`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Respuesta del servidor (tipos):', response);
    console.log('response.data:', response.data);
    
    // ✅ Manejar la estructura aquí mismo
    const responseData = response.data;
    
    // Si el servidor devuelve { success: true, data: [...] }
    if (responseData && responseData.success && Array.isArray(responseData.data)) {
      return responseData.data; // Devolver directamente el array
    }
    // Si el servidor devuelve directamente un array
    else if (Array.isArray(responseData)) {
      return responseData;
    }
    // Si hay data pero no success
    else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    // Fallback: devolver array vacío
    console.warn('Estructura de respuesta inesperada:', responseData);
    return [];
    
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

  uploadImages: async (files, folder, token) => {
    try {
      const formData = new FormData();
      formData.append('folder', folder);
      
      files.forEach(file => {
        formData.append('photos', file);
      });

      const response = await axios.post(`${BASE_URL}/roomType/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw error;
    }
  },

  createRoomTypeWithFiles: async (formData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/roomType`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error en createRoomTypeWithFiles:', error);
      throw error;
    }
  },

  updateRoomTypeWithFiles: async (id, formData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/roomType/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Tipo de habitación actualizado con archivos exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error en updateRoomTypeWithFiles:', error);
      throw error;
    }
  },

  createRoomType: async (roomTypeData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/roomType`, roomTypeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error en createRoomType:', error);
      throw error;
    }
  },

  updateRoomType: async (id, roomTypeData, token) => {
  try {
    const url = `${BASE_URL}/roomType/${id}`;
    console.log('=== DEBUG FRONTEND UPDATE ===');
    console.log('ID enviado:', id);
    console.log('URL completa:', url);
    console.log('BASE_URL:', BASE_URL);
    console.log('Datos enviados:', roomTypeData);
    
    const response = await axios.patch(url, roomTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en updateRoomType:', error);
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
