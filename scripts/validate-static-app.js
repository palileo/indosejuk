'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

const { projectRoot, startStaticServer, stopStaticServer } = require('./serve-static');
const port = 5510;
const baseUrl = `http://127.0.0.1:${port}`;

async function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function runSyntaxCheck(filePath) {
    const source = await fs.readFile(filePath, 'utf8');

    try {
        new vm.Script(source, { filename: path.relative(projectRoot, filePath) });
    } catch (error) {
        throw new Error(`Syntax check failed: ${path.relative(projectRoot, filePath)} (${error.message})`);
    }
}

function extractLocalAssetPaths(html) {
    const assetPaths = new Set();
    const attributePattern = /\b(?:src|href)=["']([^"'#]+)["']/gi;

    for (const match of html.matchAll(attributePattern)) {
        const rawPath = match[1].trim();
        if (!rawPath || /^(?:https?:|\/\/|data:|mailto:|tel:)/i.test(rawPath)) {
            continue;
        }

        assetPaths.add(rawPath.split('?')[0]);
    }

    return [...assetPaths];
}

function extractServiceWorkerShellAssets(source) {
    const shellMatch = source.match(/const APP_SHELL = \[(?<items>[\s\S]*?)\];/);
    if (!shellMatch?.groups?.items) {
        throw new Error('APP_SHELL not found in sw.js');
    }

    return [...shellMatch.groups.items.matchAll(/['"`](\.\/[^'"`]+)['"`]/g)]
        .map((match) => match[1].replace(/^\.\//, '').split('?')[0]);
}

async function assertLocalFilesExist(relativePaths) {
    for (const relativePath of relativePaths) {
        const cleanPath = relativePath.replace(/^\.\//, '');
        const absolutePath = path.join(projectRoot, cleanPath);
        try {
            const stats = await fs.stat(absolutePath);
            await assert(stats.isFile(), `Expected file but found non-file: ${cleanPath}`);
        } catch (error) {
            throw new Error(`Missing local asset: ${cleanPath}`);
        }
    }
}

async function fetchText(url) {
    const response = await fetch(url);
    await assert(response.ok, `HTTP ${response.status} for ${url}`);
    return response.text();
}

async function fetchStatus(url) {
    const response = await fetch(url);
    await assert(response.ok, `HTTP ${response.status} for ${url}`);
}

async function withServer(run) {
    const server = await startStaticServer({ port, log: false });
    try {
        return await run();
    } finally {
        await stopStaticServer(server, 'VALIDATION', { log: false });
    }
}

async function validateGitIgnore() {
    const gitIgnore = await fs.readFile(path.join(projectRoot, '.gitignore'), 'utf8');
    await assert(gitIgnore.includes('.env'), '.gitignore must ignore .env');
    await assert(gitIgnore.includes('!.env.example'), '.gitignore must keep .env.example tracked');
    await assert(gitIgnore.includes('supabase/.temp/'), '.gitignore must ignore supabase/.temp/');
}

async function main() {
    await validateGitIgnore();
    await runSyntaxCheck(path.join(projectRoot, 'app.js'));
    await runSyntaxCheck(path.join(projectRoot, 'sw.js'));
    await runSyntaxCheck(path.join(projectRoot, 'scripts/serve-static.js'));
    await runSyntaxCheck(path.join(projectRoot, 'scripts/validate-static-app.js'));

    const indexHtml = await fs.readFile(path.join(projectRoot, 'index.html'), 'utf8');
    const serviceWorkerSource = await fs.readFile(path.join(projectRoot, 'sw.js'), 'utf8');
    const htmlAssets = extractLocalAssetPaths(indexHtml);
    const swAssets = extractServiceWorkerShellAssets(serviceWorkerSource);

    await assertLocalFilesExist(htmlAssets);
    await assertLocalFilesExist(swAssets);

    await withServer(async () => {
        const landingHtml = await fetchText(`${baseUrl}/`);
        await assert(landingHtml.includes('id="loginPage"'), 'Landing page does not contain login page root');

        const appScriptMatch = landingHtml.match(/<script src="([^"]*app\.js[^"]*)"/i);
        const stylesheetMatch = landingHtml.match(/<link rel="stylesheet" href="([^"]*style\.css[^"]*)"/i);
        const manifestMatch = landingHtml.match(/<link rel="manifest" href="([^"]+)"/i);

        await assert(appScriptMatch, 'app.js reference not found in index.html');
        await assert(stylesheetMatch, 'style.css reference not found in index.html');
        await assert(manifestMatch, 'manifest reference not found in index.html');

        await fetchStatus(`${baseUrl}/${appScriptMatch[1].replace(/^\.\//, '')}`);
        await fetchStatus(`${baseUrl}/${stylesheetMatch[1].replace(/^\.\//, '')}`);
        await fetchStatus(`${baseUrl}/${manifestMatch[1].replace(/^\.\//, '')}`);
        await fetchStatus(`${baseUrl}/offline.html`);
        await fetchStatus(`${baseUrl}/icons/icon-192.png`);
    });

    console.log('Validation passed: syntax, local assets, HTTP smoke test, and .gitignore checks are clean.');
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
