import React, { useState } from "react";

export default function ChatIA() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(""); // acumula todas las respuestas

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
       const res = await fetch("http://localhost:3001/v1/chat/completions", {
  method: "POST",
  body: JSON.stringify({ 
    messages: [{ role: "user", content: input }]  // La API del proxy espera un array de mensajes
  }),
  headers: { "Content-Type": "application/json" },
});

      if (!res.ok || !res.body) {
        throw new Error("Error en la conexión con la IA");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (line.trim() === "data: [DONE]") break;

          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace(/^data:\s*/, ""));
              const content = json?.choices?.[0]?.delta?.content || "";
              accumulated += content;
              setMessages((prev) => prev + content);
            } catch (err) {
              throw new Error("Error en la conexión con la IA");
            }
          }
        }
      }

      setInput(""); // limpia input al terminar
    } catch (err) {
      setMessages("Error en la conexión con la IA");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2">
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Escribe tu mensaje..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        onClick={handleSubmit}
      >
        Consultar
      </button>
      <div className="mt-2 p-4 border rounded bg-gray-100 min-h-[100px]">
        <pre
          className="whitespace-pre-wrap"
          data-testid="chat-output"
        >
          {messages}
        </pre>
      </div>
    </div>
  );
}
