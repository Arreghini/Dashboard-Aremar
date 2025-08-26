import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatIA from "../ChatIA.jsx";

// Helper para simular streaming
function createMockStream(chunks) {
  let i = 0;
  return {
    getReader() {
      return {
        read: async () => {
          if (i < chunks.length) {
            return { value: new TextEncoder().encode(chunks[i++]), done: false };
          }
          return { done: true };
        }
      };
    }
  };
}

describe("ChatIA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza input, botón y área de respuesta", () => {
    render(<ChatIA />);
    expect(screen.getByPlaceholderText(/escribe tu mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /consultar/i })).toBeInTheDocument();
    expect(screen.getByTestId("chat-output")).toBeInTheDocument();
  });

  it("envía consulta y muestra respuesta parcial del streaming", async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hola "}}]}\n',
      'data: {"choices":[{"delta":{"content":"mundo"}}]}\n'
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(chunks)
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Hola mundo/i);
    });
  });

  it("limpia el input después de enviar mensaje", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['data: {"choices":[{"delta":{"content":"Respuesta"}}]}\n'])
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Respuesta/i);
      expect(input.value).toBe("");
    });
  });

  it("acumula varias respuestas consecutivas", async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hola"}}]}\n',
      'data: {"choices":[{"delta":{"content":" mundo"}}]}\n'
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(chunks)
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Hola mundo/i);
    });
  });

  it("muestra error si la API devuelve error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Internal Server Error"
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Probando error" } });
    fireEvent.click(screen.getByRole("button", { name: /consultar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Error en la conexión con la IA/i);
    });
  });

  it("no hace fetch si el input está vacío", async () => {
    render(<ChatIA />);
    fireEvent.click(screen.getByRole("button", { name: /consultar/i }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maneja stream vacío sin romperse", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream([])
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Pregunta vacía" } });
    fireEvent.click(screen.getByRole("button", { name: /consultar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent("");
    });
  });

  it("maneja error en el parsing de un chunk", async () => {
    const mockChunks = ['data: {not-valid-json}\n', 'data: [DONE]\n'];
    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(mockChunks)
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Probando JSON inválido" } });
    fireEvent.click(screen.getByRole("button", { name: /consultar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Error en la conexión con la IA/i);
    });
  });
});
