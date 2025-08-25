import { expect, describe, it, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatIA from "../ChatIA.jsx";
import { vi } from "vitest";

vi.stubGlobal("fetch", vi.fn()); // reemplaza global.fetch

function createMockStream(chunks) {
  let i = 0;
  return {
    getReader() {
      return {
        async read() {
          if (i < chunks.length) {
            return { value: new TextEncoder().encode(chunks[i++]), done: false };
          }
          return { done: true };
        },
      };
    },
  };
}

describe("ChatIA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza input, botón y área de respuesta", () => {
    render(<ChatIA />);
    expect(screen.getByPlaceholderText(/escribe tu mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /consultar/i })).toBeInTheDocument();
    expect(screen.getByText("", { selector: "pre" })).toBeInTheDocument();
  });

  it("envía consulta y muestra respuesta parcial del streaming", async () => {
    const mockChunks = [
      'data: {"choices":[{"delta":{"content":"Hola"}}]}\n',
      'data: {"choices":[{"delta":{"content":" mundo"}}]}\n',
      "data: [DONE]\n",
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(mockChunks),
    });

    render(<ChatIA />);

    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Hola IA" } });

    const button = screen.getByRole("button", { name: /consultar/i });
    fireEvent.click(button);

    expect(button).toHaveTextContent(/consultando/i);

    await waitFor(() => {
      expect(screen.getByText(/Hola mundo/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /consultar/i })).toBeEnabled();
  });

  it("muestra error si la API devuelve error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Internal Server Error",
    });

    render(<ChatIA />);

    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Probando error" } });

    const button = screen.getByRole("button", { name: /consultar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Error en la conexión con la IA/i)).toBeInTheDocument();
    });
  });
});
