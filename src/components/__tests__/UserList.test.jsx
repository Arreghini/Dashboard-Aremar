import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from '../UserList';
import userService from '../../services/userService';
import { useAuth0 } from '@auth0/auth0-react';
import Modal from '../Modal';

// Mocks para Vitest
vi.mock('../../services/userService');
vi.mock('@auth0/auth0-react');

describe('UserList', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      email_verified: true,
      picture: 'https://example.com/john.jpg',
      phone: '1234567890',
      dni: '12345678',
      address: 'Calle Falsa 123',
      isActive: true,
      status: 'active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
    });

    userService.getUsers.mockResolvedValue(mockUsers);
    userService.updateUser.mockResolvedValue({});
    userService.deleteUser.mockResolvedValue({});
  });

  it('muestra la lista de usuarios', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('abre el modal al hacer click en editar', async () => {
    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const editButton = screen.getAllByRole('button')[0]; // Primer botón de la fila = Edit
    fireEvent.click(editButton);

    expect(screen.getByText(/Editar Usuario/i)).toBeInTheDocument();
  });

  it('cierra el modal al actualizar usuario', async () => {
    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const editButton = screen.getAllByRole('button')[0];
    fireEvent.click(editButton);

    const nameInput = screen.getByPlaceholderText('Nombre');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    const updateButton = screen.getByText(/Actualizar/i);
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ name: 'Jane Doe' }),
        'fake-token'
      );
      // Modal cerrado
      expect(screen.queryByText(/Editar Usuario/i)).not.toBeInTheDocument();
    });
  });

  it('llama a deleteUser al confirmar eliminación', async () => {
    window.confirm = vi.fn(() => true);

    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const deleteButton = screen.getAllByRole('button')[1]; // Segundo botón = Delete
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1', 'fake-token');
    });
  });
});
