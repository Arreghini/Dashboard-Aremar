import axios from 'axios';

const apiUrl = 'http://localhost:3000/api';

const createUser = async (userData) => {
    try {
        const response = await axios.post(`${apiUrl}/users`, userData);
        console.log('Usuario creado exitosamente');
        return response.data; 
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error; 
    }
};

const updateUser = async (id, userData) => {
    try {
        const response = await axios.put(`${apiUrl}/users/${id}`, userData);
        console.log('Usuario actualizado exitosamente');
        return response.data; 
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
};

const getUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/users`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error); 
        throw error;
    }
};

const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${apiUrl}/users/${id}`);
        console.log('Usuario eliminado exitosamente');
        return response.data; 
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
    }
};

module.exports = {
    createUser,
    updateUser,
    getUsers,
    deleteUser,
};


