/** Local-only static server; no third-party package or installation needed. */
import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex < 0 ? process.env.PORT || 4173 : process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Port must be an integer between 1 and 65535');
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const reply = (status, text) => {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(text);
  };
  if (!['GET', 'HEAD'].includes(req.method)) return reply(405, 'Method not allowed');
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const parts = pathname.split('/');
    if (parts.some(p => p.startsWith('.') || ['node_modules', 'refs', 'scripts', 'tests'].includes(p))) {
      return reply(403, 'Forbidden');
    }
    const filename = await realpath(resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname)));
    if (!filename.startsWith(root + sep) || !(await stat(filename)).isFile() || !types[extname(filename)]) {
      return reply(403, 'Forbidden');
    }
    const body = await readFile(filename);
    res.writeHead(200, {
      'Content-Type': types[extname(filename)] + '; charset=utf-8',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    reply(error.code === 'ENOENT' ? 404 : 400, error.code === 'ENOENT' ? 'Not found' : 'Bad request');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Crystal Atlas: http://127.0.0.1:${port}`));
