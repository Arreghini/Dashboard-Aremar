import axios from 'axios';

const API_URL = 'http://localhost:3000/api/rooms';

const createRoom = async (data, token) => {
  try {
    const response = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; 
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    throw error; 
  }
};

const getRooms = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener las habitaciones:', error);
    throw error;
  }
};

const getRoom = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la habitación con ID ${id}:`, error);
    throw error;
  }
};

const updateRoom = async (id, data, token) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la habitación con ID ${id}:`, error);
    throw error;
  }
};

const deleteRoom = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Habitación con ID ${id} eliminada exitosamente`);
    return response.data; 
  } catch (error) {
    console.error(`Error al eliminar la habitación con ID ${id}:`, error);
    throw error;
  }
};

const roomService = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};

export default roomService;
