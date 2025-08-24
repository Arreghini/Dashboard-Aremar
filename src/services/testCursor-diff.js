import fs from 'fs';
import fetch from 'node-fetch';

const codeToFix = fs.readFileSync('./roomClasifyService.jsx', 'utf8');

async function testCursorDiff() {
  try {
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1200,
        stream: true,
        messages: [
          {
            role: 'user',
            content: `Analiza este código y devuélveme SOLO un diff estilo Git con los cambios mínimos necesarios.
No reescribas el archivo completo.
Código:\n\n${codeToFix}`
          }
        ]
      })
    });

    if (!response.body) {
      console.error('No hay body en la respuesta');
      return;
    }

    let accumulatedDiff = '';

    console.log("\n=== DIFF STREAMING DEL MODELO ===\n");

    response.body.on('data', (chunk) => {
      // Conversión segura a UTF-8
      const text = Buffer.from(chunk).toString('utf-8');
      accumulatedDiff += text;
      process.stdout.write(text);
    });

    response.body.on('end', () => {
      console.log("\n\n=== FIN DEL DIFF ===");
      fs.writeFileSync('./diff_roomClasifyService.txt', accumulatedDiff, 'utf-8');
      console.log('Diff guardado en diff_roomClasifyService.txt');
    });

  } catch (error) {
    console.error('Error al consultar Cursor:', error);
  }
}

testCursorDiff();
