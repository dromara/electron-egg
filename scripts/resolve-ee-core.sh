#!/bin/bash
# resolve-ee-core.sh — 解除 node_modules/ee-core 软链，替换为真实目录
#                        并复制 ee-core 的完整依赖树到 ee-core/node_modules/
#
# 背景：pnpm workspace 使用软链 node_modules/ee-core → ../packages/ee-core，
# electron-builder 打包时对软链处理不可靠，且 pnpm shamefully-hoist 把
# ee-core 的依赖全部提升到顶层 node_modules/，导致 ee-core 自身目录下
# 没有 node_modules/。本脚本：
#   1. 用 tar --dereference 把 packages/ee-core 变为真实目录
#   2. 递归复制 ee-core 的完整依赖树到 node_modules/ee-core/node_modules/
#   这样打包后运行时 require('axios') 等能从 ee-core 内部解析到。
#
# 用法：在 build-m / build-w 等打包命令之前运行（已集成到 package.json scripts）
#
# 注意：打包完成后 restore-ee-core.sh 会恢复软链并清理 ee-core/node_modules/

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EE_CORE_DIR="$ROOT_DIR/node_modules/ee-core"
EE_CORE_SRC="$ROOT_DIR/packages/ee-core"
TEMP_TAR="$ROOT_DIR/.ee-core-resolve.tar.gz"
TOP_NM="$ROOT_DIR/node_modules"

# ── Step 1: 解除软链 ──

if [ ! -L "$EE_CORE_DIR" ]; then
  echo "[resolve-ee-core] node_modules/ee-core 已经是真实目录，跳过软链解除。"
else
  LINK_TARGET="$(readlink "$EE_CORE_DIR")"
  echo "[resolve-ee-core] 当前软链: $EE_CORE_DIR → $LINK_TARGET"

  # 用 tar --dereference 打包，跟随软链写入真实文件
  echo "[resolve-ee-core] 打包 packages/ee-core (跟随软链)..."
  tar --dereference -czf "$TEMP_TAR" -C "$ROOT_DIR/packages" ee-core

  # 删除软链
  rm "$EE_CORE_DIR"

  # 解压到 node_modules/，得到真实目录
  echo "[resolve-ee-core] 解压到 node_modules/..."
  tar -xzf "$TEMP_TAR" -C "$TOP_NM"

  rm "$TEMP_TAR"
  echo "[resolve-ee-core] ✓ node_modules/ee-core 已变为真实目录"
fi

# ── Step 2: 递归复制 ee-core 的依赖树 ──
# 读取 ee-core/package.json 的 dependencies，递归收集所有依赖包名，
# 从顶层 node_modules/ 复制到 ee-core/node_modules/（用 cp -rL 解析软链）

echo "[resolve-ee-core] 收集 ee-core 依赖树..."

# 用 Python 递归收集所有依赖包名（直接 + 传递）
DEPS_LIST=$(python3 -c "
import json, os

top_nm = '$TOP_NM'
ee_pkg = '$EE_CORE_DIR/package.json'

visited = set()

def collect(pkg_name):
    if pkg_name in visited:
        return
    visited.add(pkg_name)
    pkg_dir = os.path.join(top_nm, pkg_name)
    pkg_json = os.path.join(pkg_dir, 'package.json')
    if not os.path.isfile(pkg_json):
        return
    try:
        with open(pkg_json) as f:
            d = json.load(f)
    except:
        return
    # 收集 dependencies + optionalDependencies
    for key in ('dependencies', 'optionalDependencies'):
        for dep in d.get(key, {}):
            # 排除 ee-core 自身和 workspace 包
            if dep == 'ee-core' or dep == 'ee-bin':
                continue
            collect(dep)

# 从 ee-core 的 dependencies 开始
with open(ee_pkg) as f:
    ee = json.load(f)
for key in ('dependencies', 'optionalDependencies'):
    for dep in ee.get(key, {}):
        if dep == 'ee-core' or dep == 'ee-bin':
            continue
        collect(dep)

# 按名字排序输出
for name in sorted(visited):
    print(name)
")

DEP_COUNT=$(echo "$DEPS_LIST" | wc -l | tr -d ' ')
echo "[resolve-ee-core] 共 $DEP_COUNT 个依赖包需要复制"

# 创建 ee-core/node_modules/ 目录
NM_DIR="$EE_CORE_DIR/node_modules"
mkdir -p "$NM_DIR"

# 逐包复制（先创建 @scope 父目录，再用 cp -rL 解析软链）
echo "[resolve-ee-core] 复制依赖到 ee-core/node_modules/..."
COPIED=0
SKIPPED=0
FAILED=0
for dep in $DEPS_LIST; do
  src="$TOP_NM/$dep"
  dest="$NM_DIR/$dep"
  if [ ! -d "$src" ]; then
    echo "[resolve-ee-core]   ⚠ $dep 不存在于顶层 node_modules/，跳过"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  if [ -d "$dest" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  # 对 @scope 包，先创建父目录
  if [[ "$dep" == @*/* ]]; then
    scope_dir="$NM_DIR/${dep%%/*}"
    mkdir -p "$scope_dir"
  fi
  # 用 cp -rL 解析软链为真实文件
  cp -rL "$src" "$dest" 2>/dev/null || {
    # cp -rL 可能在某些特殊文件上失败，回退到 cp -r（保留软链）
    echo "[resolve-ee-core]   ⚠ $dep cp -rL 失败，回退到 cp -r"
    rm -rf "$dest" 2>/dev/null
    cp -r "$src" "$dest"
    FAILED=$((FAILED + 1))
  }
  COPIED=$((COPIED + 1))
done

echo "[resolve-ee-core] ✓ 复制完成: $COPIED 个包, $SKIPPED 个跳过"
echo "[resolve-ee-core] 打包完成后请运行: bash scripts/restore-ee-core.sh"
