import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyRecargaWeb } from './verify-recarga-web.mjs';

function filesIn(directory, prefix = '') {
  return readdirSync(path.join(directory, prefix)).sort().flatMap(name => {
    const relative = prefix ? `${prefix}/${name}` : name;
    const stat = lstatSync(path.join(directory, relative));
    if (stat.isSymbolicLink()) throw new Error(`Unexpected export symlink: ${relative}`);
    if (stat.isDirectory()) return filesIn(directory, relative);
    if (!stat.isFile()) throw new Error(`Unexpected export entry: ${relative}`);
    return [relative];
  });
}

export function packageRecargaWeb({ source, destination, version }) {
  const stage = mkdtempSync(path.join(tmpdir(), 'recarga-package-'));
  try {
    for (const relative of filesIn(source)) {
      if (relative === 'metadata.json') continue;
      const allowed = relative === 'index.html' || relative === 'favicon.ico' ||
        /^_expo\/static\/.+\.(js|css)$/.test(relative) ||
        /^assets\/.+\.(png|jpg|jpeg|webp|gif|svg|ttf|otf|woff2?)$/.test(relative);
      if (!allowed) throw new Error(`Unexpected export file: ${relative}`);
      const target = path.join(stage, relative);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, readFileSync(path.join(source, relative)));
    }
    const htmlFile = path.join(stage, 'index.html');
    let html = readFileSync(htmlFile, 'utf8');
    html = html.replace(/<html\b[^>]*>/, '<html lang="pt-BR">')
      .replace(/<title>[^<]*<\/title>/, '<title>Tetelestai Recarga — Planejar recarga</title>')
      .replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
      .replace('</head>', '<meta name="robots" content="noindex,nofollow" />\n<link rel="canonical" href="https://tetelestai.tech/recarga/" />\n<meta name="description" content="Estime o tempo de recarga do seu carro e o horário para começar. Grátis, sem anúncios e sem cadastro." />\n<meta name="theme-color" content="#000C19" />\n</head>')
      .replace('<body>', '<body><noscript>Ative o JavaScript para usar a calculadora de recarga. <a href="/recarga/suporte/">Acessar suporte</a>.</noscript>');
    writeFileSync(htmlFile, html.replace(/[ \t]+$/gm, ''));
    const files = filesIn(stage).map(relative => ({
      path: relative,
      sha256: createHash('sha256').update(readFileSync(path.join(stage, relative))).digest('hex'),
    }));
    writeFileSync(path.join(stage, 'release.json'), JSON.stringify({ version, basePath: '/recarga/', files }, null, 2) + '\n');
    verifyRecargaWeb(stage);
    if (existsSync(destination)) {
      const previous = verifyRecargaWeb(destination);
      const managed = new Set(['release.json', ...previous.files.map(file => file.path)]);
      for (const relative of filesIn(destination)) {
        if (!managed.has(relative)) throw new Error(`Unmanaged release file: ${relative}`);
      }
      // Replace only the directory owned by the previously validated release.
      const backup = `${destination}.previous-${process.pid}`;
      if (existsSync(backup)) throw new Error(`Release backup already exists: ${backup}`);
      renameSync(destination, backup);
      try {
        mkdirSync(destination, { recursive: true });
        copyStage(stage, destination);
      } catch (error) {
        rmSync(destination, { recursive: true, force: true });
        renameSync(backup, destination);
        throw error;
      }
      rmSync(backup, { recursive: true });
    } else {
      mkdirSync(destination, { recursive: true });
      copyStage(stage, destination);
    }
    return verifyRecargaWeb(destination);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

function copyStage(stage, destination) {
  for (const relative of filesIn(stage)) {
    const target = path.join(destination, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(path.join(stage, relative)));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const app = path.join(root, 'charging-app');
  const output = mkdtempSync(path.join(tmpdir(), 'recarga-expo-'));
  try {
    const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'export', '--platform', 'web', '--output-dir', output, '--max-workers', '2'], {
      cwd: app, env: { ...process.env, TETELESTAI_WEB_EXPORT: '1', CI: '1', EXPO_NO_TELEMETRY: '1' }, stdio: 'inherit',
    });
    if (result.status !== 0) throw new Error(`Expo export failed: ${result.error?.message || result.status}`);
    const config = JSON.parse(readFileSync(path.join(app, 'app.json'), 'utf8'));
    const release = packageRecargaWeb({ source: output, destination: path.join(root, 'public/recarga'), version: config.expo.version });
    console.log(`Recarga ${release.version}: ${release.files.length} verified browser files in public/recarga`);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
}
