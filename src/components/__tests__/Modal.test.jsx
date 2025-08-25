import { expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('no renderiza cuando isOpen es false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Contenido del modal</p>
      </Modal>
    );

    expect(screen.queryByText(/contenido del modal/i)).not.toBeInTheDocument();
  });

  it('renderiza cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Contenido del modal</p>
      </Modal>
    );

    expect(screen.getByText(/contenido del modal/i)).toBeInTheDocument();
  });

  it('llama a onClose al hacer click en el fondo', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Contenido del modal</p>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog').parentElement; // div del fondo
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer click en el botón de cerrar', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Contenido del modal</p>
      </Modal>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('no llama a onClose al hacer click dentro del contenido', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="contenido">Contenido del modal</div>
      </Modal>
    );

    const content = screen.getByTestId('contenido');
    fireEvent.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });
});
