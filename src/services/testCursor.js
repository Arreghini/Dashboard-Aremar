import fs from 'fs';
import fetch from 'node-fetch';

const codeToFix = fs.readFileSync('./roomClasifyService.jsx', 'utf8');

async function testCursor() {
  try {
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1000,
        stream: true,
        messages: [{ role: 'user', content: `Corrige este código:\n\n${codeToFix}` }]
      })
    });

    if (!response.body) {
      console.error('No hay body en la respuesta');
      return;
    }

    const decoder = new TextDecoder();
    let accumulatedText = '';

    console.log("\n=== RESPUESTA STREAMING ===\n");

    // Node stream
    response.body.on('data', (chunk) => {
      const text = decoder.decode(chunk, { stream: true });
      accumulatedText += text;
      process.stdout.write(text);
    });

    response.body.on('end', () => {
      console.log("\n\n=== FIN STREAMING ===");
      fs.writeFileSync('./analisis_roomClasifyService.txt', accumulatedText);
      console.log('Resultado guardado en analisis_roomClasifyService.txt');
    });

  } catch (error) {
    console.error('Error al consultar Cursor:', error);
  }
}

testCursor();
