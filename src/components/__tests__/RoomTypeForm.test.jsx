import { expect, it, describe, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomTypeForm from '../RoomTypeForm';

// Mock del servicio
vi.mock('../../services/roomClasifyService', () => {
  return {
    default: {
      createRoomTypeWithFiles: vi.fn().mockResolvedValue({}),
    },
  };
});

// Mock de Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
  }),
}));

describe('RoomTypeForm', () => {

  it('permite completar datos y enviar el formulario con éxito', async () => {
    const onRoomTypeCreated = vi.fn();
    render(<RoomTypeForm onRoomTypeCreated={onRoomTypeCreated} />);

    fireEvent.change(screen.getByLabelText(/Nombre del tipo de habitación/i), { target: { value: 'Suite Deluxe' } });
    fireEvent.change(screen.getByLabelText(/🛏️ Camas simples/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/🛏️ Camas cucheta/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/👑 Camas matrimoniales/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/🪟 Ventanas/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/💰 Precio por noche/i), { target: { value: '120.50' } });

    fireEvent.click(screen.getByText(/Crear Tipo de Habitación/i));

    const successAlert = await screen.findByText(/Tipo de habitación creado con éxito/i);
    expect(successAlert).toBeInTheDocument();

    const roomClasifyService = (await import('../../services/roomClasifyService')).default;
    expect(roomClasifyService.createRoomTypeWithFiles).toHaveBeenCalled();
    expect(onRoomTypeCreated).toHaveBeenCalled();
  });

  it('muestra un error si el servicio falla', async () => {
    const mockService = (await import('../../services/roomClasifyService')).default;
    mockService.createRoomTypeWithFiles.mockRejectedValueOnce(new Error('Fallo de red'));

    render(<RoomTypeForm />);

    fireEvent.change(screen.getByLabelText(/Nombre del tipo de habitación/i), { target: { value: 'Error Room' } });
    fireEvent.click(screen.getByText(/Crear Tipo de Habitación/i));

    const errorAlert = await screen.findByText(/Fallo de red/i);
    expect(errorAlert).toBeInTheDocument();
  });

  it('desactiva el botón de submit si el nombre está vacío', () => {
    render(<RoomTypeForm />);
    const submitButton = screen.getByText(/Crear Tipo de Habitación/i);
    expect(submitButton).toBeDisabled();
  });

  it('resetea el formulario correctamente', () => {
    render(<RoomTypeForm />);
    fireEvent.change(screen.getByLabelText(/Nombre del tipo de habitación/i), { target: { value: 'Reset Room' } });

    const resetButton = screen.getByText(/Limpiar formulario/i);
    fireEvent.click(resetButton);

    expect(screen.getByLabelText(/Nombre del tipo de habitación/i).value).toBe('');
    expect(screen.getByLabelText(/🛏️ Camas simples/i).value).toBe('0');
  });

  it('muestra el número de archivos seleccionados', () => {
    render(<RoomTypeForm />);
    const fileInput = screen.getByLabelText(/📷 Fotos de la habitación/i);

    const files = [new File(['dummy'], 'foto1.png', { type: 'image/png' })];
    fireEvent.change(fileInput, { target: { files } });

    expect(screen.getByText(/1 archivo\(s\) seleccionado\(s\)/i)).toBeInTheDocument();
  });
});
