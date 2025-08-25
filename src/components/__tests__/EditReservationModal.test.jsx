import { expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import EditReservationModal from '../EditReservationModal';

describe('EditReservationModal', () => {
  const mockReservation = {
    id: '123',
    roomId: 'P1D1',
    checkIn: '2025-09-01T00:00:00Z',
    checkOut: '2025-09-05T00:00:00Z',
    numberOfGuests: 2,
    status: 'pending',
    totalPrice: '1000',
    amountPaid: '200',
    paymentId: 'pay_123',
  };

  it('no renderiza cuando isOpen es false', () => {
    render(
      <EditReservationModal
        isOpen={false}
        onClose={vi.fn()}
        reservation={mockReservation}
        onSave={vi.fn()}
      />
    );

    expect(screen.queryByText(/editar reserva/i)).not.toBeInTheDocument();
  });

  it('muestra los datos de la reserva cuando isOpen es true', () => {
    render(
      <EditReservationModal
        isOpen={true}
        onClose={vi.fn()}
        reservation={mockReservation}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('P1D1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-09-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-09-05')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('pending');
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
  });

  it('permite editar campos y llama a onSave al enviar', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditReservationModal
        isOpen={true}
        onClose={handleClose}
        reservation={mockReservation}
        onSave={handleSave}
      />
    );

    const roomInput = screen.getByLabelText(/id habitación/i);
    fireEvent.change(roomInput, { target: { value: 'P2D3' } });

    const submitButton = screen.getByText(/guardar/i);
    fireEvent.click(submitButton);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: 'P2D3' })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('llama a onClose al presionar cancelar', () => {
    const handleClose = vi.fn();

    render(
      <EditReservationModal
        isOpen={true}
        onClose={handleClose}
        reservation={mockReservation}
        onSave={vi.fn()}
      />
    );

    const cancelButton = screen.getByText(/cancelar/i);
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
