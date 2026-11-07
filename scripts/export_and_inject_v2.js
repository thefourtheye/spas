#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
let OUTDIR = 'out';
let TARGET_DIR = '../thefourtheye.in/static/apps';
let BASE_HREF = '/apps/';
let MODE = 'full'; // modes: full, build, copy, blog, inject

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--outdir') { OUTDIR = argv[++i]; }
  else if (a === '--target') { TARGET_DIR = argv[++i]; }
  else if (a === '--base') { BASE_HREF = argv[++i]; }
  else if (a === '--build-only') { MODE = 'build'; }
  else if (a === '--copy-only') { MODE = 'copy'; }
  else if (a === '--blog-only') { MODE = 'blog'; }
  else if (a === '--inject-only') { MODE = 'inject'; }
  else if (a === '--help') { console.log('Usage: node scripts/export_and_inject_v2.js [--outdir out] [--target ../thefourtheye.in/static/apps] [--base /apps/] [--build-only|--copy-only|--blog-only|--inject-only]'); process.exit(0); }
  else { console.error('Unknown arg', a); process.exit(1); }
}

// Allow overriding target/base via environment (useful in CI)
if (process.env.TARGET) TARGET_DIR = process.env.TARGET;
if (process.env.BASE) BASE_HREF = process.env.BASE;
if (process.env.OUTDIR) OUTDIR = process.env.OUTDIR;

console.log('MODE=', MODE, 'OUTDIR=', OUTDIR, 'TARGET_DIR=', TARGET_DIR, 'BASE_HREF=', BASE_HREF);

console.log('OUTDIR=', OUTDIR, 'TARGET_DIR=', TARGET_DIR, 'BASE_HREF=', BASE_HREF);

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

async function walk(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await walk(p));
    } else if (entry.isFile() && p.endsWith('.html')) {
      results.push(p);
    }
  }
  return results;
}

async function copyDir(src, dest) {
  if (!fsSync.existsSync(src)) return;
  // remove dest if exists
  if (fsSync.existsSync(dest)) {
    try { fsSync.rmSync(dest, { recursive: true, force: true }); }
    catch (e) {
      // fallback
      const rimraf = (p) => {
        if (!fsSync.existsSync(p)) return;
        for (const name of fsSync.readdirSync(p)) {
          const cur = path.join(p, name);
          const stat = fsSync.statSync(cur);
          if (stat.isDirectory()) rimraf(cur);
          else fsSync.unlinkSync(cur);
        }
        fsSync.rmdirSync(p);
      };
      rimraf(dest);
    }
  }
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  // Build the Next app
  if (MODE === 'build') {
    try {
      run('npm run build');
      console.log('Build-only mode complete.');
      process.exit(0);
    } catch (err) {
      console.error('Next build failed');
      process.exit(1);
    }
  }

  try {
    run('npm run build');
  } catch (err) {
    console.error('Next build failed');
    process.exit(1);
  }

  // Determine export output directory
  let actualOut = OUTDIR;
  if (!fsSync.existsSync(actualOut)) {
    const exportDetail = path.join('.next', 'export-detail.json');
    if (fsSync.existsSync(exportDetail)) {
      try {
        const info = JSON.parse(fsSync.readFileSync(exportDetail, 'utf8'));
        if (info && info.outDirectory) actualOut = info.outDirectory;
      } catch (e) {
        // ignore
      }
    }
  }

  // If OUTDIR not found, try `npx next export --outdir out` as a fallback
  if (!fsSync.existsSync(actualOut)) {
    try {
      run('npx next export --outdir ' + OUTDIR);
      if (fsSync.existsSync(OUTDIR)) actualOut = OUTDIR;
    } catch (e) {
      console.error('Export not supported by installed Next CLI and no export output was found.');
      console.error('Ensure next.config.js has output: "export" or use an older Next that supports next export.');
      process.exit(1);
    }
  }

  OUTDIR = actualOut;

  if (!fsSync.existsSync(OUTDIR)) {
    console.error('Export output not found:', OUTDIR);
    process.exit(1);
  }

  // If blog-only mode, run blog build and exit before copying exported files
  if (MODE === 'blog') {
    try {
      console.log('Blog-only mode: building blog to produce compiled CSS...');
      run('cd ../thefourtheye.in && make build');
      console.log('Blog-only mode complete.');
      process.exit(0);
    } catch (e) {
      console.warn('Blog build failed — CSS may not be available:', e.message || e);
      process.exit(1);
    }
  }

  // Copy exported files into blog static/apps (skip only for inject-only)
  if (MODE !== 'inject') {
    console.log('Copying exported files to target:', TARGET_DIR);
    await copyDir(OUTDIR, TARGET_DIR);
  } else {
    console.log('Inject-only mode: skipping copy of exported files.');
  }

  if (MODE === 'copy') {
    console.log('Copy-only mode complete. Files are available under', TARGET_DIR);
    process.exit(0);
  }

  // Build the blog to produce compiled (fingerprinted) CSS files
  try {
    console.log('Building blog to produce compiled CSS...');
    run('cd ../thefourtheye.in && make build');
  } catch (e) {
    console.warn('Blog build failed — CSS may not be available:', e.message || e);
  }

  // Find compiled CSS under the blog public folder and copy into TARGET_DIR/css
  const blogCssDir = path.join('..', 'thefourtheye.in', 'public', 'css');
  const targetCssDir = path.join(TARGET_DIR, 'css');
  let cssFiles = [];
  try {
    if (fsSync.existsSync(blogCssDir)) {
      const all = fsSync.readdirSync(blogCssDir).filter(f => f.endsWith('.css'));
      if (all.length > 0) {
        fsSync.mkdirSync(targetCssDir, { recursive: true });
        for (const f of all) {
          const src = path.join(blogCssDir, f);
          const dest = path.join(targetCssDir, f);
          try { fsSync.copyFileSync(src, dest); cssFiles.push(f); console.log('  copied CSS:', f); }
          catch (e) { console.warn('  failed copying css', f, e.message || e); }
        }
      } else {
        console.warn('No CSS files found in', blogCssDir);
      }
    } else {
      console.warn('Blog public css directory not found:', blogCssDir);
    }
  } catch (e) {
    console.warn('Error while copying blog CSS:', e.message || e);
  }

  // Copy only the fonts the theme CSS references
  const blogFontsDir = path.join('..', 'thefourtheye.in', 'public', 'fonts');
  const targetFontsDir = path.join(TARGET_DIR, 'fonts');
  const fontRefs = new Set();
  for (const f of cssFiles) {
    const css = fsSync.readFileSync(path.join(targetCssDir, f), 'utf8');
    for (const m of css.matchAll(/url\(\s*(?:["'])?\.\.\/fonts\/([^)"']+)/g)) fontRefs.add(m[1]);
  }
  if (fsSync.existsSync(blogFontsDir) && fontRefs.size > 0) {
    fsSync.rmSync(targetFontsDir, { recursive: true, force: true });
    fsSync.mkdirSync(targetFontsDir, { recursive: true });
    for (const name of fontRefs) {
      const src = path.join(blogFontsDir, name);
      if (fsSync.existsSync(src)) fsSync.copyFileSync(src, path.join(targetFontsDir, name));
      else console.warn('  missing font:', name);
    }
    console.log('  copied fonts:', fontRefs.size);
  } else {
    console.warn('No theme fonts found under', blogFontsDir);
  }

  // Inject base href + CSS links + body wrapper + rewrite _next references in exported HTML files
  const htmlFiles = await walk(TARGET_DIR);
  console.log('Found', htmlFiles.length, 'HTML files. Injecting theme links...');
  for (const file of htmlFiles) {
    try {
      let s = await fs.readFile(file, 'utf8');
      if (s.indexOf('<!-- BLOG-THEME-INJECT -->') !== -1) {
        // already injected
        continue;
      }

      // build CSS link tags (relative so base href controls resolution)
      let cssLinks = '';
      if (cssFiles.length > 0) {
        cssLinks = cssFiles.map(f => `  <link rel="stylesheet" href="css/${f}">`).join('\n');
      } else {
        // fallback to non-fingerprinted names (still ok if blog serves them)
        cssLinks = '  <link rel="stylesheet" href="css/common.css">\n  <link rel="stylesheet" href="css/content.css">';
      }

      s = s.replace(/(<head\b[^>]*>)/i, `$1\n  <!-- BLOG-THEME-INJECT -->\n  <base href="${BASE_HREF}">\n${cssLinks}`);

      s = s.replace(/(<body\b[^>]*>)/i, `$1\n<div id=\"wrapper\">\n<div class=\"content\">`);
      s = s.replace(/(<\/body>)/i, `\n</div>\n</div>\n$1`);

      // rewrite absolute /_next/ references -> ${BASE_HREF}_next/
      try {
        s = s.replace(/(href=(?:"|')|src=(?:"|'))\/_next\//g, (m, p1) => `${p1}${BASE_HREF}_next/`);
      } catch (e) {
        // ignore
      }

      await fs.writeFile(file, s, 'utf8');
      console.log('  injected', file);
    } catch (e) {
      console.warn('  failed to inject', file, e.message || e);
    }
  }

  console.log('Export + inject + copy complete. Files are available under', TARGET_DIR);
})();
