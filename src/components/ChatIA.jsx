// ChatIA.jsx
import { useState } from "react";

export default function ChatIA() {
  const [input, setInput] = useState("");
  const [responseText, setResponseText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setResponseText("");

    try {
      const res = await fetch("/api/chat", { 
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        try {
          const chunk = JSON.parse(decoder.decode(value));
          if (chunk?.choices?.[0]?.delta?.content) {
            setResponseText(prev => prev + chunk.choices[0].delta.content);
          }
        } catch {
          setErrorMessage("Error en la conexión con la IA");
        }
      }
    } catch {
      setErrorMessage("Error en la conexión con la IA");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2">
        <input
          placeholder="Escribe tu mensaje..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        {loading ? "Consultando..." : "Consultar"}
      </button>
      <div className="mt-2 p-4 border rounded bg-gray-100 min-h-[100px]">
        <pre
          data-testid="chat-output"
          className="whitespace-pre-wrap"
        >
          {errorMessage || responseText}
        </pre>
      </div>
    </div>
  );
}
