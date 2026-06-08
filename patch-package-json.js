#!/usr/bin/env node
// patch-package-json.js
// Injects repository, bugs, homepage, and publishConfig into every
// packages/*/package.json.

const fs = require('fs');
const path = require('path');

const GH_REPO = 'https://github.com/EldrexDelosReyesBula/PapyrusJS';
const HOMEPAGE = 'https://papyrus-js.vercel.app/';

const packagesDir = path.join(__dirname, 'packages');
const dirs = fs.readdirSync(packagesDir).filter(d =>
    fs.statSync(path.join(packagesDir, d)).isDirectory()
);

let patched = 0;

for (const dir of dirs) {
    const pkgPath = path.join(packagesDir, dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Repository field
    pkg.repository = {
        type: 'git',
        url: `git+${GH_REPO}.git`,
        directory: `packages/${dir}`
    };

    // Bugs field
    pkg.bugs = { url: `${GH_REPO}/issues` };

    // Homepage
    pkg.homepage = HOMEPAGE;

    // publishConfig — dual registry (npm default, GitHub Packages for GitHub display)
    pkg.publishConfig = {
        access: 'public',
        registry: 'https://registry.npmjs.org'
    };

    // Author canonical format
    pkg.author = {
        name: 'Eldrex Delos Reyes Bula',
        url: `${GH_REPO}`
    };

    // Write back with 2-space indent + trailing newline
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`✅ Patched: packages/${dir}/package.json  (${pkg.name}@${pkg.version})`);
    patched++;
}

console.log(`\n🎉 Patched ${patched} package.json files.`);
