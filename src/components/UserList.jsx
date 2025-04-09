import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import userService from '../services/userService';
import Modal from './Modal';

const UserList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    emailVerified: false,
    picture: '',
    phone: '',
    dni: '',
    address: '',
    isActive: true,
  });
  
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const usersData = await userService.getUsers(token);
        setUsers(usersData);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleEdit = async (user) => {
    setIsModalOpen(true);
    setFormData(user);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      emailVerified: false,
      picture: '',
      phone: '',
      dni: '',
      address: '',
      isActive: true,
    });
  };

  const handleUpdateUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      await userService.updateUser(formData.id, formData, token);
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Estás seguro de que quieres eliminar este usuario')) {
    try {
      const token = await getAccessTokenSilently();
      await userService.deleteUser(id, token);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar el usuario:',error);
    }
  }
};

return (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b border-gray-300">Id</th>
          <th className="py-2 px-4 border-b border-gray-300">Name</th>
          <th className="py-2 px-4 border-b border-gray-300">Email</th>
          <th className="py-2 px-4 border-b border-gray-300">Email-verified</th>
          <th className="py-2 px-4 border-b border-gray-300">Picture</th>
          <th className="py-2 px-4 border-b border-gray-300">Phone</th>
          <th className="py-2 px-4 border-b border-gray-300">Dni</th>
          <th className="py-2 px-4 border-b border-gray-300">Address</th>
          <th className="py-2 px-4 border-b border-gray-300">IsActive</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="py-2 px-4 border-b border-gray-300">{user.id}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.name}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.email}</td>
            <td className="py-2 px-4 border-b border-gray-300"> {user.email_verified ? (
          <p>✅</p>
        ) : (
          <p>❌</p>)}</td>
            <td className="py-2 px-4 border-b border-gray-300"><img 
            src={user.picture} 
            alt={`${user.name}'s profile`} 
            className="w-12 h-12 rounded-full" 
            /></td>
            <td className="py-2 px-4 border-b border-gray-300">{user.phone}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.dni}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.address}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.isActive}</td>
            <td className="py-2 px-4 border-b border-gray-300">

              <button onClick={() => handleEdit(user)} 
              className="text-blue-500 hover:text-blue-700 mr-2">
              <FaEdit />
              </button>

              <button onClick={() => handleDelete(user.id)}
              className="text-red-500 hover:text-red-700">
              <FaTrash />
              </button>

            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Modal para editar usuario */}
    {isModalOpen && (
<Modal isOpen={isModalOpen} onClose={handleCloseModal}>
  <h2 className="text-lg font-bold mb-4">Editar Usuario</h2>
  <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
          <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value })}
              placeholder="Nombre"
              className="mb-2 w-full"
              required  
              />
            <input 
              type="text" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value })}
              placeholder="Email" 
              className="mb-2 w-full"
              required 
              />
            <input 
              type="boolean" 
              value={formData.emailVerified} 
              onChange={(e) => setFormData({...formData, emailVerified: e.target.checked })}
              placeholder="Email verificado" 
              className="mb-2 w-full"
              />              
            <input 
              type="text" 
              value={formData.picture} 
              onChange={(e) => setFormData({...formData, picture: e.target.value })}
              placeholder="URL de la imagen"
              className="mb-2 w-full"
              />
            <input 
              type="text" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value })}
              placeholder="Teléfono"
              className="mb-2 w-full"
              />
            <input 
              type="text" 
              value={formData.dni} 
              onChange={(e) => setFormData({...formData, dni: e.target.value })}
              placeholder="DNI"
              className="mb-2 w-full"
              />
            <input 
              type="text" 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value })}
              placeholder="Dirección"
              className="mb-2 w-full"
              />
            <input 
              type="boolean" 
              value={formData.isActive} 
              onChange={(e) => setFormData({...formData, isActive: e.target.checked })}
              placeholder="Está activo?"
              className="mb-2 w-full"
              required
              />
          <select 
            value={formData.status} 
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mb-2 w-full"
            required
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2">Actualizar</button>
        </form>
      </Modal>
    )}
  </div>
);
};

export default UserList;
