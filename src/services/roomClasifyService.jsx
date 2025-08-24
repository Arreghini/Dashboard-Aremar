import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms/admin';

const roomClasifyService = {
  // Método de prueba para verificar conectividad
  testConnection: async () => {
    try {
      console.log('🧪 Probando conectividad con el backend...');
      // Probar con diferentes endpoints
      try {
        const response = await axios.get('http://localhost:3000/', {
          timeout: 5000,
        });
        console.log('✅ Backend responde en /:', response.status);
        return true;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Backend responde pero / no existe (normal)');
          return true;
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Backend no responde:', error.message);
      return false;
    }
  },
  getRoomTypes: async (token) => {
    try {
      console.log('🔑 Token recibido en getRoomTypes:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Probar el endpoint de tipos de habitación
      const response = await axios.get(`${BASE_URL}/roomType`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta del servidor (tipos):', response);
      console.log('response.data:', response.data);

      const responseData = response.data;

      if (
        responseData &&
        responseData.success &&
        Array.isArray(responseData.data)
      ) {
        return responseData.data;
      }
      else if (Array.isArray(responseData)) {
        return responseData;
      }
      else if (responseData && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      console.warn('Estructura de respuesta inesperada:', responseData);
      return [];
    } catch (error) {
      console.error('Error al obtener los tipos de habitación:', error);
      console.error('Error completo:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Si hay un error de autenticación, devolver array vacío en lugar de lanzar error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('⚠️ Error de autenticación, devolviendo array vacío');
        return [];
      }
      
      throw error;
    }
  },

  getRoomDetailById: async (roomId, token) => {
    try {
      console.log('ID de habitación recibido:', roomId);
      const response = await axios.get(`${BASE_URL}/roomDetail/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Respuesta del servidor (detalles específicos):', response);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los detalles de la habitación:', error);
      
      // Si es un error 500 o 404, devolver null en lugar de lanzar error
      if (error.response?.status === 500 || error.response?.status === 404) {
        console.log(`⚠️ Detalle con ID ${roomId} no disponible (${error.response.status})`);
        return null;
      }
      
      throw error;
    }
  },

  // Método para obtener todos los detalles (si existe el endpoint)
  getAllRoomDetails: async (token) => {
    try {
      console.log('🔍 Intentando obtener todos los detalles de habitación...');
      
      // Probar diferentes endpoints posibles
      const endpoints = [
        `${BASE_URL}/roomDetail`,
        `${BASE_URL}/roomDetails`,
        `http://localhost:3000/api/roomDetail`,
        `http://localhost:3000/api/roomDetails`,
        `${BASE_URL}/room-detail`,
        `${BASE_URL}/room-details`,
        `${BASE_URL}/roomDetail/all`,
        `${BASE_URL}/roomDetails/all`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🧪 Probando endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log(`✅ Endpoint ${endpoint} funcionó:`, response.data);
          
          const responseData = response.data;
          
          if (responseData && responseData.success && Array.isArray(responseData.data)) {
            return responseData.data;
          } else if (Array.isArray(responseData)) {
            return responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            return responseData.data;
          }
          
          console.warn('Estructura de respuesta inesperada:', responseData);
          return [];
          
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} falló:`, error.response?.status);
          continue; // Probar el siguiente endpoint
        }
      }
      
      // Si ningún endpoint funcionó, devolver array vacío
      console.log('⚠️ Ningún endpoint de detalles funcionó, devolviendo array vacío');
      return [];
      
    } catch (error) {
      console.error('Error al obtener todos los detalles de habitación:', error);
      return [];
    }
  },

  uploadImages: async (files, folder, token) => {
    try {
      const formData = new FormData();
      formData.append('folder', folder);

      files.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await axios.post(
        `${BASE_URL}/roomType/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en createRoomTypeWithFiles:', error);
      throw error;
    }
  },

  updateRoomTypeWithFiles: async (id, formData, token) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/roomType/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en updateRoomType:', error);
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
        },
      }
    );
    console.log('Detalle de habitación creado exitosamente');
    return response.data; // 👈 cambiar aquí
  } catch (error) {
    console.log('Datos enviados:', roomDetailData);
    throw error;
  }
},

  updateRoomDetail: async (id, roomData, token) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/roomDetail/${id}`,
        roomData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Detalles de la habitación actualizados exitosamente');
      return response.data;
    } catch (error) {
      console.error(
        'Error al actualizar los detalles de la habitación:',
        error
      );
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
        },
      });

      console.log('Respuesta del servidor:', response);

      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Tipo de habitación eliminado correctamente',
          id: id,
          data: response.data,
        };
      }
    } catch (error) {
      console.error('Error completo:', error.response || error);
      throw new Error(
        `Error al eliminar: ${error.response?.data?.message || error.message}`
      );
    }
  },

  deleteRoomDetail: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/roomDetail/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Detalles de la habitación eliminados exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar los detalles de la habitación:', error);
      throw error;
    }
  },
};

export default roomClasifyService;
