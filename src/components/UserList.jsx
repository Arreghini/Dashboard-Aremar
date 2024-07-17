

import React, { useEffect, useState } from 'react';
import userService from '../services/userService';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        try {
            await userService.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await userService.updateUser(userId, { isActive: !currentStatus });
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isActive: !currentStatus } : user
            ));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Lista de Usuarios</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.email} - {user.isActive ? 'Activo' : 'Inactivo'}
                        <button onClick={() => handleToggleActive(user.id, user.isActive)}>
                            {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => handleDelete(user.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
