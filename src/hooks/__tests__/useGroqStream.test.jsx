import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGroqStream } from "../useGroqStream";

// ---- Mocks ----
class MockEventSource {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.closed = false;
  }
  close() {
    this.closed = true;
  }
}

// Mock window.EventSource
beforeEach(() => {
  window.EventSource = vi.fn((url, options) => new MockEventSource(url, options));
  window.fetch = vi.fn().mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useGroqStream", () => {
  test("actualiza respuesta al recibir mensajes y cierra el stream", async () => {
    const { result } = renderHook(() => useGroqStream());

    act(() => {
      result.current.consultar("Hola mundo");
    });

    const esInstance = window.EventSource.mock.results[0].value;

    // Simulamos conexión abierta
    act(() => {
      esInstance.onopen();
    });

    // Simulamos mensajes
    act(() => {
      esInstance.onmessage({ data: JSON.stringify({ choices: [{ delta: { content: "Hola" } }] }) });
      esInstance.onmessage({ data: JSON.stringify({ choices: [{ delta: { content: " Mundo" } }] }) });
      esInstance.onmessage({ data: "[DONE]" });
    });

    expect(result.current.respuesta).toBe("Hola Mundo");
    expect(result.current.loading).toBe(false);
    expect(esInstance.closed).toBe(true);

    expect(window.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/v1/chat/completions",
      expect.any(Object)
    );
  });

  test("maneja error en el stream", async () => {
    const { result } = renderHook(() => useGroqStream());

    act(() => {
      result.current.consultar("Test error");
    });

    const esInstance = window.EventSource.mock.results[0].value;

    act(() => {
      esInstance.onerror("Stream error");
    });

    expect(result.current.loading).toBe(false);
    expect(esInstance.closed).toBe(true);
  });
});
