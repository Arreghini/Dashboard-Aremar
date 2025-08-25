import fs from 'fs';
import fetch from 'node-fetch';

const codeToFix = fs.readFileSync('../components/ReservationForm.jsx', 'utf8');

async function testCursor() {
  try {
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1000,
        stream: true,
        messages: [
          { role: 'user', content: `Corrige este código:\n\n${codeToFix}` }
        ]
      })
    });

    if (!response.body) {
      console.error('No hay body en la respuesta');
      return;
    }

    const decoder = new TextDecoder();
    let accumulatedText = '';

    console.log("\n=== RESPUESTA STREAMING ===\n");

    let buffer = '';
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');

      // Guardamos el último fragmento para el próximo chunk
      buffer = lines.pop();

      for (const line of lines) {
        // Cada línea viene con "data: {...}" en streaming SSE
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace(/^data: /, '').trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || '';
            process.stdout.write(content);
            accumulatedText += content;
          } catch (e) {
            // ignoramos líneas que no sean JSON
          }
        }
      }
    }

    console.log("\n\n=== FIN STREAMING ===");
    fs.writeFileSync('./analisis_ReservationForm.txt', accumulatedText);
    console.log('Resultado guardado en analisis_ReservationForm.txt');

  } catch (error) {
    console.error('Error al consultar Cursor:', error);
  }
}

testCursor();
