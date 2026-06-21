#!/bin/bash
# restore-ee-core.sh — 打包完成后恢复 node_modules/ee-core 软链，并清理依赖
#
# 用法：bash scripts/restore-ee-core.sh
#
# 原理：删除真实目录 node_modules/ee-core（含 node_modules 子目录），
# 重新创建软链指向 packages/ee-core，恢复 pnpm workspace 的正常联动。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EE_CORE_DIR="$ROOT_DIR/node_modules/ee-core"

# 检查当前状态
if [ -L "$EE_CORE_DIR" ]; then
  echo "[restore-ee-core] node_modules/ee-core 已经是软链，无需操作。"
  exit 0
fi

# 删除真实目录（含复制的 node_modules 子目录）
echo "[restore-ee-core] 删除真实目录 node_modules/ee-core (含依赖)..."
rm -rf "$EE_CORE_DIR"

# 重建软链
echo "[restore-ee-core] 重建软链: node_modules/ee-core → ../packages/ee-core"
ln -s "../packages/ee-core" "$EE_CORE_DIR"

echo "[restore-ee-core] ✓ 软链已恢复，开发环境正常"
