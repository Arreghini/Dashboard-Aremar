
import fs from 'fs';
import { applyPatch } from 'diff';

const FILE_PATH = './roomClasifyService.jsx';
const DIFF_PATH = './lastDiff.txt'; // acá guardamos el diff recibido

// Función para aplicar el diff
function applyDiff() {
  try {
    const originalCode = fs.readFileSync(FILE_PATH, 'utf8');
    const diffContent = fs.readFileSync(DIFF_PATH, 'utf8');

    // Aplica el parche
    const patchedCode = applyPatch(originalCode, diffContent);

    if (!patchedCode) {
      console.error('❌ No se pudo aplicar el diff. Verificá el formato.');
      return;
    }

    // Guardamos el archivo modificado
    fs.writeFileSync(FILE_PATH, patchedCode, 'utf8');
    console.log(`✅ Diff aplicado correctamente en ${FILE_PATH}`);
  } catch (error) {
    console.error('Error al aplicar diff:', error);
  }
}

applyDiff();
