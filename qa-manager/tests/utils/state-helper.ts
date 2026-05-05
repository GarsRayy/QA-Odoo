import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'test-results', 'shared-state.json');

/**
 * Menyimpan data ke shared state (misal: nama project, ID, dll)
 */
export function saveState(key: string, value: any) {
  let state: any = {};
  
  if (!fs.existsSync(path.dirname(STATE_FILE))) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  }

  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
      state = {};
    }
  }

  state[key] = value;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`💾 State Saved: ${key} = ${value}`);
}

/**
 * Mengambil data dari shared state
 */
export function getState(key: string, defaultValue: any = null) {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return state[key] || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
}
