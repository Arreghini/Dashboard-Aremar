import fs from 'fs';
import fetch from 'node-fetch';

// Archivo con el código a evaluar
const codeToFix = fs.readFileSync('./roomClasifyService.jsx', 'utf8');

async function testCursor() {
  try {
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1000,
        stream: true, // Streaming activado
        messages: [
          {
            role: 'user',
            content: `Analiza este código y responde SOLO en este formato:

🔍 Errores detectados:
- ...

⚠️ Malas prácticas:
- ...

💡 Recomendaciones:
- ...

No reescribas todo el archivo, solo señala los puntos clave.
Código:\n\n${codeToFix}`
          }
        ]
      })
    });

    if (!response.body) {
      console.error('No hay body en la respuesta');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    console.log("\n=== ANÁLISIS STREAMING DEL MODELO ===\n");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // SSE puede traer varias líneas, cada línea con "data: {...}"
      chunk.split("\n").forEach(line => {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") return;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              accumulatedText += delta;
              process.stdout.write(delta); // Mostrar en tiempo real
            }
          } catch {
            // ignorar líneas que no sean JSON
          }
        }
      });
    }

    console.log("\n\n=== FIN DEL ANÁLISIS ===");

    // Opcional: guardar resultado completo en un archivo
    fs.writeFileSync('./analisis_roomClasifyService.txt', accumulatedText);
    console.log('Resultado guardado en analisis_roomClasifyService.txt');

  } catch (error) {
    console.error('Error al consultar Cursor:', error);
  }
}

testCursor();
