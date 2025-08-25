import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserForm from '../../components/UserForm'
import userService from '../../services/userService'

// Mock de Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
  }),
}))

// Mock de userService
vi.mock('../../services/userService')

describe('UserForm', () => {
  it('renderiza el formulario', () => {
    render(<UserForm />)
    expect(screen.getByText(/Create New User/i)).toBeInTheDocument()
  })

  it('permite completar los campos y enviar', async () => {
    render(<UserForm />)

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Juan Perez' } })
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'juan@test.com' } })
    fireEvent.change(screen.getByLabelText(/Phone:/i), { target: { value: '123456789' } })

    fireEvent.click(screen.getByRole('button', { name: /Create User/i }))

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalled()
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Juan Perez',
          email: 'juan@test.com',
          phone: '123456789',
        }),
        'fake-token'
      )
    })
  })
})
