import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoomTypeEditModal from "../../components/molecules/RoomTypesEditModal";

describe("RoomTypeEditModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    formData: {
      name: "Suite",
      simpleBeds: 1,
      trundleBeds: 0,
      kingBeds: 1,
      windows: 2,
      price: 100,
    },
    setFormData: vi.fn(),
    existingPhotos: ["photo1.jpg", "photo2.jpg"],
    setNewPhotos: vi.fn(),
    removeExistingPhoto: vi.fn(),
    error: "",
    isSubmitting: false,
  };

  it("no se renderiza si isOpen es false", () => {
    render(<RoomTypeEditModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Editar Tipo de Habitación/i)).toBeNull();
  });

  it("renderiza título y botones principales", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    expect(
      screen.getByText("Editar Tipo de Habitación")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar cambios/i })).toBeInTheDocument();
  });

  it("muestra mensaje de error si existe", () => {
    render(<RoomTypeEditModal {...defaultProps} error="Algo salió mal" />);
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
  });

  it("permite modificar el nombre de la habitación", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "Nueva Suite" } });
    expect(defaultProps.setFormData).toHaveBeenCalledWith({
      ...defaultProps.formData,
      name: "Nueva Suite",
    });
  });

  it("permite subir nuevas fotos", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    const fileInput = screen.getByLabelText(/Agregar nuevas fotos/i);
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(defaultProps.setNewPhotos).toHaveBeenCalled();
  });

  it("muestra fotos existentes y permite eliminarlas", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    const deleteButtons = screen.getAllByRole("button", { name: "✕" });
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.removeExistingPhoto).toHaveBeenCalledWith(0);
  });

  it("ejecuta onClose al presionar el botón cancelar", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("ejecuta onSubmit al guardar cambios", () => {
    render(<RoomTypeEditModal {...defaultProps} />);
    fireEvent.submit(screen.getByRole("form"));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });
});
