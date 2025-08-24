import { useState } from "react";

export default function ChatIA() {
  const [respuesta, setRespuesta] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    if (!consulta.trim()) return;

    setRespuesta("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: consulta }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en proxy:", errorText);
        setRespuesta("Error en la conexión con la IA.");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));
        for (let line of lines) {
          const data = line.replace(/^data: /, "");
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) setRespuesta((prev) => prev + text);
          } catch (err) {
            console.error("Error parsing chunk:", err, data);
          }
        }
      }
    } catch (err) {
      console.error("Error general:", err);
      setRespuesta("Error en la conexión con la IA.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="mb-2">
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={handleConsultar}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        disabled={loading}
      >
        {loading ? "Consultando..." : "Consultar"}
      </button>

      <div className="mt-2 p-4 border rounded bg-gray-100 min-h-[100px]">
        <pre className="whitespace-pre-wrap">{respuesta}</pre>
      </div>
    </div>
  );
}
