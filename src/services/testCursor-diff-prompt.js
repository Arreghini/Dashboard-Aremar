import fs from 'fs';
import fetch from 'node-fetch';
import readline from 'readline';
import { applyPatch } from 'diff';

// Archivo original
const FILE_PATH = './roomClasifyService.jsx';

async function testCursorDiffPrompt() {
  try {
    const codeToFix = fs.readFileSync(FILE_PATH, 'utf8');

    // Llamada al proxy
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1200,
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

    const data = await response.json();
    const diff = data.choices[0].message.content;

    console.log("\n=== DIFF SUGERIDO POR EL MODELO ===\n");
    console.log(diff);

    // Preguntar si aplicar
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n¿Querés aplicar este diff al archivo? (s/n): ', (answer) => {
      if (answer.toLowerCase() === 's') {
        const patchedCode = applyPatch(codeToFix, diff);
        if (!patchedCode) {
          console.error('❌ No se pudo aplicar el diff. Verificá el formato.');
        } else {
          fs.writeFileSync(FILE_PATH, patchedCode, 'utf8');
          console.log(`✅ Diff aplicado correctamente en ${FILE_PATH}`);
        }
      } else {
        console.log('⚠️ Diff no aplicado. Tu archivo queda intacto.');
      }
      rl.close();
    });

  } catch (error) {
    console.error('Error al consultar Cursor o aplicar diff:', error);
  }
}

testCursorDiffPrompt();
