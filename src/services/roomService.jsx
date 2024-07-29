import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

const getRooms = async () => {
  const response = await api.get('/rooms/all');
  return response.data;
};

const getRoom = async (id) => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data;
};

const updateRoom = async (id, roomData) => {
  const response = await api.put(`/rooms/${id}`, roomData);
  return response.data;
};

const deleteRoom = async (id) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};

export default {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
