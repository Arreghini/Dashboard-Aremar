import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { describe, beforeEach, it, expect } from "vitest";
import RoomForm from "../RoomForm";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { name: "Test User" },
    getAccessTokenSilently: vi.fn().mockResolvedValue("fake-token"),
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("RoomForm", () => {
  const onSubmitMock = vi.fn();

  beforeEach(() => {
    onSubmitMock.mockClear();
  });

  it("renderiza el formulario con todos los campos", () => {
    render(<RoomForm onSubmit={onSubmitMock} />);

    expect(screen.getByLabelText(/ID de la Habitación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Combinación de Servicios/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fotos de la habitación/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /crear habitación/i })
    ).toBeInTheDocument();
  });

//   it("permite ingresar datos en los campos y enviar el formulario", () => {
//     render(<RoomForm onSubmit={onSubmitMock} />);

//     fireEvent.change(screen.getByLabelText(/ID de la Habitación/i), {
//       target: { value: "P3D2" },
//     });
//     fireEvent.change(screen.getByLabelText(/Capacidad/i), {
//       target: { value: "4" },
//     });
//     fireEvent.change(screen.getByLabelText(/Descripción/i), {
//       target: { value: "Vista al mar" },
//     });
//     fireEvent.change(screen.getByLabelText(/Precio/i), {
//       target: { value: "150" },
//     });
//     fireEvent.change(screen.getByLabelText(/Tipo/i), {
//       target: { value: "suite" },
//     });
//     fireEvent.change(screen.getByLabelText(/Estado/i), {
//       target: { value: "available" },
//     });
//     fireEvent.change(screen.getByLabelText(/Combinación de Servicios/i), {
//       target: { value: "combo1" },
//     });

//     // Simulamos archivo
//     const fileInput = screen.getByLabelText(/Fotos de la habitación/i);
//     const file = new File(["foto"], "foto.png", { type: "image/png" });
//     fireEvent.change(fileInput, { target: { files: [file] } });

//     // Enviar formulario
//     fireEvent.click(screen.getByRole("button", { name: /crear habitación/i }));

//     expect(onSubmitMock).toHaveBeenCalledTimes(1);
//   });

  it("no llama a onSubmit si los campos requeridos están vacíos", () => {
    render(<RoomForm onSubmit={onSubmitMock} />);

    fireEvent.click(screen.getByRole("button", { name: /crear habitación/i }));

    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
