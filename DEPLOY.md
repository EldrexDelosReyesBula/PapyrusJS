# 🚀 Deploy Guide — Papyrus.js to npm & GitHub

This guide explains how to publish a new Papyrus.js release to both **npmjs.org** and **GitHub Packages**, and how the GitHub Actions CI/CD pipeline works.

---

## 📋 One-Time Setup (only needed once)

### 1. Add npm Token to GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|-------------|-------|
| `NPM_TOKEN` | Your npm auth token (from `~/.npmrc` or `npm token create`) |

> The token in your local `.npmrc` is gitignored. The workflow uses `secrets.NPM_TOKEN` instead.

### 2. Enable GitHub Packages

GitHub Packages uses the automatic `GITHUB_TOKEN` — **no extra setup required**.

### 3. Add GitHub Environments (optional but recommended)

Go to **Settings → Environments** and create:
- `npm` — for npm publish job (add required reviewers if desired)
- `github-packages` — for GitHub Packages publish job

---

## 🔄 Release Flow

### Step 1 — Make sure everything is built and passing

```bash
node build.js
node public/tests/verify-build.js
```

All 150+ assertions must pass.

### Step 2 — Commit all changes

```bash
git add -A
git commit -m "release: v3.1.3 Foundation Strengthening Release"
git push origin main
```

This triggers the **CI workflow** (`ci.yml`) which runs on Node 18 + 20.

### Step 3 — Tag the release

```bash
git tag v3.1.3
git push origin v3.1.3
```

This triggers the **Release workflow** (`release.yml`) which:
1. ✅ Builds all 19 bundles
2. ✅ Runs 150+ verification assertions
3. 📦 Publishes all 14 packages to **npmjs.org** (with provenance)
4. 📦 Publishes all 14 packages to **GitHub Packages**
5. 🎉 Creates a **GitHub Release** with bundle attachments + auto-extracted changelog

---

## 🏗️ Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | push/PR to `main` | Build + verify on Node 18 & 20 |
| [`.github/workflows/release.yml`](./.github/workflows/release.yml) | push `v*` tag | Build → npm → GitHub Packages → GitHub Release |

---

## 📦 Published Packages

| Package | npm | GitHub |
|---------|-----|--------|
| `@eldrex/papyr` | [npmjs.com](https://www.npmjs.com/package/@eldrex/papyr) | [pkg.github.com](https://github.com/EldrexDelosReyesBula/PapyrusJS/packages) |
| `@eldrex/papyr-watt` | [npmjs.com](https://www.npmjs.com/package/@eldrex/papyr-watt) | [pkg.github.com](https://github.com/EldrexDelosReyesBula/PapyrusJS/packages) |
| `@eldrex/papyr-pssr` | [npmjs.com](https://www.npmjs.com/package/@eldrex/papyr-pssr) | [pkg.github.com](https://github.com/EldrexDelosReyesBula/PapyrusJS/packages) |
| `@eldrex/papyr-router` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-animate` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-charts` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-ai` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-db` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-auth` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-ssr` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-seo` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-game` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-shapes` | npmjs.com | pkg.github.com |
| `@eldrex/papyr-3d` | npmjs.com | pkg.github.com |

---

## 🛠️ Install from Different Registries

### From npm (public)
```bash
npm install @eldrex/papyr
npm install @eldrex/papyr-watt
npm install @eldrex/papyr-pssr
```

### From GitHub Packages
```bash
# Add to your project .npmrc:
@eldrex:registry=https://npm.pkg.github.com

# Then install normally:
npm install @eldrex/papyr
```

---

## 🔒 Security Notes

- Your local `.npmrc` (with the npm token) is **gitignored** — it will never be committed
- The workflow uses GitHub Actions secrets (`NPM_TOKEN`, `GITHUB_TOKEN`) only
- All npm publishes use `--provenance` for supply chain security attestation
- `GITHUB_TOKEN` is automatically available in all GitHub Actions workflows

---

## 🔁 Future Releases

For every future release, the process is identical:

```bash
# 1. Build
node build.js
node public/tests/verify-build.js

# 2. Commit
git add -A
git commit -m "release: vX.X.X Description"
git push origin main

# 3. Tag → triggers auto-publish
git tag vX.X.X
git push origin vX.X.X
```
