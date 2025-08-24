import { useState, useCallback } from "react";

export function useGroqStream() {
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);

  const consultar = useCallback(async (prompt) => {
    setRespuesta("");
    setLoading(true);

    const eventSource = new EventSource("http://localhost:3001/v1/chat/completions", {
      withCredentials: false,
    });

    eventSource.onopen = () => {
      console.log("Conexión SSE abierta ✅");
      // enviamos el body con fetch POST (el proxy de Node escucha)
      fetch("http://localhost:3001/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      });
    };

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setLoading(false);
        eventSource.close();
        return;
      }

      try {
        const json = JSON.parse(event.data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          setRespuesta((prev) => prev + delta);
        }
      } catch (e) {
        console.error("Error parseando chunk:", e, event.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Error en stream:", err);
      setLoading(false);
      eventSource.close();
    };
  }, []);

  return { respuesta, loading, consultar };
}
