import React, { useState } from 'react';
import userService from '../services/userService';

const UserForm = ({ user = {}, onSave }) => {
  const [formData, setFormData] = useState({
    id: user.id || '',
    name: user.name || '',
    email: user.email || '',
    isActive: user.isActive || true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await userService.updateUser(formData.id, formData);
      } else {
        await userService.createUser(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{formData.id ? 'Edit User' : 'Create User'}</h1>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Active:
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
      </label>
      <button type="submit">{formData.id ? 'Update User' : 'Create User'}</button>
    </form>
  );
};

export default UserForm;
