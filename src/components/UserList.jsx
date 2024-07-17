import React, { useEffect, useState } from 'react';
import userService from '../services/userService';

const UserList = ({ onEdit, onDelete }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userService.getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    await userService.deleteUser(userId);
    onDelete();
  };

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} className="flex justify-between items-center my-2">
          <span>{user.name} - {user.email}</span>
          <div>
            <button onClick={() => onEdit(user)} className="mx-1">Editar</button>
            <button onClick={() => handleDelete(user.id)} className="mx-1">Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
