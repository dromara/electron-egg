/**
 * OpenHarmony HNP 打包脚本（goapp）
 *
 * 背景：PC 25 镜像起，内核 XPM 会拦截未签名二进制的 exec（spawn EACCES）。
 * HNP 是官方给出的签名放行方案：把二进制打进 .hnp 包，随 HAP 安装时由系统
 * 释放并签名，应用即可正常 spawn。
 * 参考：https://gitcode.com/openharmony-sig/electron/blob/master/docs/hnp-packaging-guide/README.md
 *
 * 流程：
 * 1. 组装 staging 目录 build/hnp/goapp/：hnp.json + bin/goapp/goapp（交叉编译产物）
 * 2. 调 hnpcli pack → ohos_hap/hnp/arm64-v8a/goapp.hnp
 *    （hvigor 打包 HAP 时把 hnp/arm64-v8a/*.hnp 带入，安装时系统释放到
 *     沙箱物理路径 /data/app/goapp.org/goapp_1.0/bin/goapp/goapp 并签名）
 *
 * 版本常量需与 electron/service/cross.ts 中的 HNP 路径保持一致。
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HNP_NAME = 'goapp';
const HNP_VERSION = '1.0';

const projectRoot = path.resolve(__dirname, '..');
const binary = path.join(projectRoot, 'build/extraResources-ohos/goapp');
const staging = path.join(projectRoot, 'build/hnp', HNP_NAME);
const outDir = path.join(projectRoot, 'ohos_hap/hnp/arm64-v8a');

// hnpcli 来自 DevEco SDK toolchains，可用环境变量 HNPCLI 覆盖
const hnpcli =
  process.env.HNPCLI ||
  '/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hnpcli';

function main() {
  if (!fs.existsSync(binary)) {
    console.error(`[hnp] 找不到 goapp 产物: ${binary}\n[hnp] 请先执行 npm run build-go-ohos`);
    process.exit(1);
  }
  if (!fs.existsSync(hnpcli)) {
    console.error(`[hnp] 找不到 hnpcli: ${hnpcli}\n[hnp] 可通过环境变量 HNPCLI 指定`);
    process.exit(1);
  }

  // 1. staging：hnp.json + bin/<name>/<binary>（每次重建，避免脏产物）
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(path.join(staging, 'bin', HNP_NAME), { recursive: true });
  const manifest = {
    type: 'hnp-config',
    name: HNP_NAME,
    version: HNP_VERSION,
    install: {
      links: [{ source: `/bin/${HNP_NAME}`, target: HNP_NAME }],
    },
  };
  fs.writeFileSync(path.join(staging, 'hnp.json'), JSON.stringify(manifest, null, 4));
  fs.copyFileSync(binary, path.join(staging, 'bin', HNP_NAME, HNP_NAME));

  // 2. 打包 .hnp
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${HNP_NAME}.hnp`);
  fs.rmSync(outFile, { force: true });
  const r = spawnSync(
    hnpcli,
    ['pack', '-i', staging, '-o', outDir, '-n', HNP_NAME, '-v', HNP_VERSION],
    { stdio: 'inherit' },
  );
  if (r.status !== 0 || !fs.existsSync(outFile)) {
    console.error(`[hnp] hnpcli pack 失败 (exit=${r.status})，未生成 ${outFile}`);
    process.exit(1);
  }
  console.log(`[hnp] 生成 ${path.relative(projectRoot, outFile)} (${fs.statSync(outFile).size} bytes)`);
}

main();
