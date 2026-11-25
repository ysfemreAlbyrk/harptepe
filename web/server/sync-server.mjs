import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = path.join(rootDir, 'server', '.data');
const stateFile = path.join(dataDir, 'game-state.json');
const port = Number(process.env.PORT || 8787);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let sharedState = null;
try {
  sharedState = JSON.parse(await readFile(stateFile, 'utf8'));
} catch {
  sharedState = null;
}

async function persistState(state) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(stateFile, JSON.stringify(state), 'utf8');
}

const server = createServer(async (request, response) => {
  if (!request.url || request.method !== 'GET') {
    response.writeHead(405);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.normalize(path.join(distDir, pathname));

  if (!filePath.startsWith(distDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Önce npm run build çalıştırın; dist içinde dosya bulunamadı.');
    return;
  }

  const body = await readFile(filePath);
  response.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  response.end(body);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.on('message', async (raw) => {
    try {
      const message = JSON.parse(String(raw));
      if (message.type === 'hello') {
        socket.send(JSON.stringify({ type: 'state', state: sharedState }));
        return;
      }
      if (message.type !== 'state' || !message.state?.kingdoms || !message.state?.nextIds) return;
      sharedState = message.state;
      await persistState(sharedState);
      for (const client of wss.clients) {
        if (client !== socket && client.readyState === 1) {
          client.send(JSON.stringify({ type: 'state', state: sharedState }));
        }
      }
    } catch {
      // Bozuk mesajlar yok sayılır.
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Harptepe senkronizasyon ve web sunucusu hazır: http://localhost:${port}`);
  console.log('Aynı ağdaki oyuncular için bu bilgisayarın yerel IP adresini paylaşın.');
});
