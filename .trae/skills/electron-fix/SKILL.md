---
name: "electron-fix"
description: "Auto-diagnose and fix Electron installation issues (missing binary, failed postinstall). Invoke when encountering 'Electron failed to install correctly' error, electron command fails, or node_modules/electron/dist is missing."
---

# Electron Fix

This skill automatically diagnoses and fixes common Electron installation problems, especially when the Electron binary fails to download or install correctly.

## When to Use

Invoke this skill when:
- Terminal shows `Error: Electron failed to install correctly, please delete node_modules/electron and try installing again`
- Running `pnpm dev-electron` or electron-related commands fails immediately
- `node_modules/electron/dist/` directory is missing or incomplete
- Electron binary is corrupted after pnpm/npm operations

## Diagnosis Steps

1. Check if `node_modules/electron` exists
2. Check if `node_modules/electron/dist/` contains the actual Electron binary
   - macOS: `dist/Electron.app/Contents/MacOS/Electron`
   - Linux: `dist/electron`
   - Windows: `dist/electron.exe`
3. If dist is missing, the postinstall script failed to download the binary

## Fix Procedure

Follow these steps exactly:

### Step 1: Remove broken electron

```bash
rm -rf node_modules/electron
```

Also remove from lockfile if necessary:
```bash
# Remove electron entries from pnpm-lock.yaml
```

### Step 2: Reinstall electron package

```bash
pnpm install
```

Or install electron specifically:
```bash
pnpm add -D electron@<version>
```

### Step 3: Trigger binary download (CRITICAL)

`pnpm install` does not always run postinstall scripts for cached packages. Manually trigger the binary download:

```bash
node node_modules/electron/install.js
```

Expected output:
```
Downloading electron-vX.X.X-platform-arch.zip: [=========] 100% ETA: 0.0 seconds
```

### Step 4: Verify installation

Verify the Electron binary exists:

- macOS:
```bash
ls -la node_modules/electron/dist/Electron.app/Contents/MacOS/Electron
```

- Linux:
```bash
ls -la node_modules/electron/dist/electron
```

- Windows:
```bash
ls -la node_modules/electron/dist/electron.exe
```

### Step 5: Retry the original command

```bash
pnpm dev-electron
```

## Common Causes

| Cause | Solution |
|-------|----------|
| pnpm cache reuse without postinstall | Always run `node node_modules/electron/install.js` after reinstall |
| Network/mirror issues | Check `.npmrc` has correct `electron_mirror` config |
| Partial download | Delete `node_modules/electron` and retry |
| Corrupted lockfile | Remove lockfile and node_modules, then `pnpm install` |

## Mirror Configuration

Ensure `.npmrc` contains:

```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

For other regions, use appropriate mirrors:
- China: `https://npmmirror.com/mirrors/electron/`
- Default: `https://github.com/electron/electron/releases/download/v`

## Prevention

After any pnpm operation that touches electron (remove/add/install), always verify:

```bash
# Quick check function
electron_installed() {
  local bin_path
  if [[ "$OSTYPE" == "darwin"* ]]; then
    bin_path="node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"
  elif [[ "$OSTYPE" == "linux"* ]]; then
    bin_path="node_modules/electron/dist/electron"
  else
    bin_path="node_modules/electron/dist/electron.exe"
  fi
  
  if [[ -f "$bin_path" ]]; then
    echo "Electron is properly installed"
    return 0
  else
    echo "Electron binary missing, running install.js..."
    node node_modules/electron/install.js
    return 1
  fi
}
```
