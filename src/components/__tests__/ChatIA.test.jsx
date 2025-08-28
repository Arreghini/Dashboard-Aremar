import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatIA from "../ChatIA.jsx";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

// Mock de ReadableStream compatible
function createMockReadableStream(chunks) {
  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk)));
      controller.close();
    },
  });
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
      'data: {"choices":[{"delta":{"content":"mundo"}}]}\n',
      'data: [DONE]\n'
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockReadableStream(chunks)
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Hola mundo/i);
    }, { timeout: 3000 });
  });

  it("limpia el input después de enviar mensaje", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      body: createMockReadableStream([
        'data: {"choices":[{"delta":{"content":"Respuesta"}}]}\n',
        'data: [DONE]\n'
      ])
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Respuesta/i);
      expect(input.value).toBe("");
    }, { timeout: 3000 });
  });

  it("acumula varias respuestas consecutivas", async () => {
    const chunks1 = [
      'data: {"choices":[{"delta":{"content":"Hola"}}]}\n',
      'data: {"choices":[{"delta":{"content":" mundo"}}]}\n',
      'data: [DONE]\n'
    ];
    const chunks2 = [
      'data: {"choices":[{"delta":{"content":"Otra"}}]}\n',
      'data: {"choices":[{"delta":{"content":" respuesta"}}]}\n',
      'data: [DONE]\n'
    ];

    fetch
      .mockResolvedValueOnce({ ok: true, body: createMockReadableStream(chunks1) })
      .mockResolvedValueOnce({ ok: true, body: createMockReadableStream(chunks2) });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);

    // Primera consulta
    fireEvent.change(input, { target: { value: "Primera" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Hola mundo/i);
    }, { timeout: 3000 });

    // Segunda consulta
    fireEvent.change(input, { target: { value: "Segunda" } });
    fireEvent.click(screen.getByText(/Consultar/i));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Hola mundoOtra respuesta/i);
    }, { timeout: 3000 });
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
      body: createMockReadableStream([])
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
      body: createMockReadableStream(mockChunks)
    });

    render(<ChatIA />);
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "JSON inválido" } });
    fireEvent.click(screen.getByRole("button", { name: /consultar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("chat-output")).toHaveTextContent(/Error en la conexión con la IA/i);
    });
  });
});
