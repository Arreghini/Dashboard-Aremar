const API_URL = 'https://api.example.com/users'; // URL del API de usuarios

const getUsers = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Error fetching users');
    }
    return response.json();
};

const createUser = async (userData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Error creating user');
    }
    return response.json();
};

const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Error deleting user');
    }
    return response.json();
};

const updateUser = async (userId, updates) => {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    if (!response.ok) {
        throw new Error('Error updating user');
    }
    return response.json();
};

const userService = {
    getUsers,
    createUser,
    deleteUser,
    updateUser,
};

export default userService;
