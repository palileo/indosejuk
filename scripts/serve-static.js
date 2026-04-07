'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 5500;

const mimeTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.js', 'application/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml; charset=utf-8'],
    ['.webmanifest', 'application/manifest+json; charset=utf-8'],
    ['.webp', 'image/webp']
]);

function readFlag(name) {
    const direct = process.argv.find((value) => value.startsWith(`${name}=`));
    if (direct) {
        return direct.slice(name.length + 1);
    }

    const flagIndex = process.argv.indexOf(name);
    if (flagIndex >= 0 && process.argv[flagIndex + 1]) {
        return process.argv[flagIndex + 1];
    }

    return null;
}

function normalizeRequestPath(requestUrl) {
    const parsedUrl = new URL(requestUrl, 'http://127.0.0.1');
    const pathname = decodeURIComponent(parsedUrl.pathname);
    return pathname === '/' ? '/index.html' : pathname;
}

function resolvePath(requestPath) {
    const absolutePath = path.normalize(path.join(projectRoot, requestPath));
    const relativePath = path.relative(projectRoot, absolutePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return null;
    }

    return absolutePath;
}

function sendNotFound(response) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
}

function sendForbidden(response) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
}

function createStaticServer() {
    return http.createServer((request, response) => {
        if (!request.url) {
            sendNotFound(response);
            return;
        }

        const requestPath = normalizeRequestPath(request.url);
        const absolutePath = resolvePath(requestPath);

        if (!absolutePath) {
            sendForbidden(response);
            return;
        }

        fs.stat(absolutePath, (statError, stats) => {
            if (statError || !stats.isFile()) {
                sendNotFound(response);
                return;
            }

            response.writeHead(200, {
                'Cache-Control': 'no-cache',
                'Content-Type': mimeTypes.get(path.extname(absolutePath).toLowerCase()) || 'application/octet-stream'
            });

            const stream = fs.createReadStream(absolutePath);
            stream.on('error', () => {
                if (!response.headersSent) {
                    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                }
                response.end('Internal Server Error');
            });
            stream.pipe(response);
        });
    });
}

function startStaticServer({
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
    log = true
} = {}) {
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid port: ${port}`);
    }

    const server = createStaticServer();

    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, () => {
            if (log) {
                console.log(`Indo Sejuk static server running at http://${host}:${port}`);
            }
            resolve(server);
        });
    });
}

async function stopStaticServer(server, signal = 'SIGTERM', { log = true } = {}) {
    if (!server?.listening) {
        return;
    }

    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            if (log) {
                console.log(`Static server stopped (${signal})`);
            }
            resolve();
        });
    });
}

module.exports = {
    createStaticServer,
    DEFAULT_HOST,
    DEFAULT_PORT,
    projectRoot,
    startStaticServer,
    stopStaticServer
};

if (require.main === module) {
    const host = readFlag('--host') || process.env.HOST || DEFAULT_HOST;
    const port = Number.parseInt(readFlag('--port') || process.env.PORT || `${DEFAULT_PORT}`, 10);

    let server;
    startStaticServer({ host, port })
        .then((instance) => {
            server = instance;
        })
        .catch((error) => {
            console.error(error.message);
            process.exit(1);
        });

    async function shutdown(signal) {
        try {
            await stopStaticServer(server, signal);
            process.exit(0);
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
