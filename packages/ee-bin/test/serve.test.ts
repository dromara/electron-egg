import { describe, it, expect, vi } from 'vitest';
import binDefault from '../src/config/bin_default.js';
import { ServeProcess } from '../src/tools/serve.js';

describe('bin_default', () => {
  it('enables electron watch by default', () => {
    expect(binDefault.dev.electron.watch).toBe(true);
  });
});

describe('ServeProcess._devBundle', () => {
  it('copy 模式回退到 bundle()，不创建 esbuild context', async () => {
    const sp = new ServeProcess();
    const bundleSpy = vi.spyOn(sp as any, 'bundle').mockResolvedValue(undefined);
    await (sp as any)._devBundle({ bundleType: 'copy' });
    expect(bundleSpy).toHaveBeenCalledOnce();
    expect((sp as any).bundleCtx).toBeNull();
  });

  it('无 bundleConfig 时直接返回', async () => {
    const sp = new ServeProcess();
    await expect((sp as any)._devBundle(undefined)).resolves.toBeUndefined();
    expect((sp as any).bundleCtx).toBeNull();
  });
});
