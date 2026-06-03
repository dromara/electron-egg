# 日志时间戳支持时区配置（默认 UTC，可选本地时区）

- **日期**：2026-06-02
- **类型**：功能增强（非 bug 修复）
- **涉及文件**：`packages/ee-core/src/log/logger.ts`、`packages/ee-core/src/types/index.ts`、`packages/ee-core/src/config/default_config.ts`

## 背景

pino 写入日志文件的 JSON `time` 字段原本固定用 `pino.stdTimeFunctions.isoTime`，**永远输出 UTC**（带 `Z`），无法按需改成本地时区。需求是：默认保持 UTC（机器可读、利于接入 ELK/Loki 等日志平台），但允许显式配置成某个时区（如 `Asia/Shanghai`）输出本地挂钟时间。

## 设计取舍

时间戳分两层，本次只改 JSON 文件层：

- **JSON 文件日志（`ee.log` / `ee-core.log` / `ee-error.log`）** ← 本次改动，权威持久化产物
- **终端 pino-pretty 输出** — 未改。它走 `translateTime: 'SYS:...'`（机器本地时间），仅 dev 终端用；pino-pretty 原生不支持指定 IANA 时区。

为什么默认 UTC 而非本地：机器可读日志的业界惯例是存 UTC，由展示层再转时区，避免进聚合系统后因本地偏移导致解析/排序问题。所以默认 UTC，**按需**本地化。

为什么不引入 luxon：ee-core 是要发 npm 的框架核心包，为一个时间戳给所有使用者增加 ~70KB 依赖不划算。改用 Node 内置的 `Intl.DateTimeFormat`（零依赖）。

## 实现

`logger.ts` 新增 `buildTimezoneTimeFn(timeZone)`，遵循 pino 时间戳契约（返回 `,"time":...` 片段）：

```ts
function buildTimezoneTimeFn(timeZone: string): () => string {
  // UTC 快路径：标准 ISO 'Z'，与 pino 原生 isoTime 完全一致，且省去 Intl 开销
  if (timeZone === 'UTC') {
    return function utcTime(): string {
      return `,"time":"${new Date().toISOString()}"`;
    };
  }
  // 其它 IANA 时区：用 Intl longOffset 生成带偏移的 ISO
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZoneName: 'longOffset',
  });
  return function timezoneTime(): string {
    const now = new Date();
    const parts: Record<string, string> = {};
    for (const p of dtf.formatToParts(now)) parts[p.type] = p.value;
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const raw = parts.timeZoneName || 'GMT';      // longOffset 产出 'GMT+08:00' 或纯 'GMT'
    const offset = raw === 'GMT' ? '+00:00' : raw.replace('GMT', '');
    const hour = parts.hour === '24' ? '00' : parts.hour;  // 个别引擎午夜返回 '24'，规整为 '00'
    return `,"time":"${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:${parts.second}.${ms}${offset}"`;
  };
}
```

`create()` 里读取 timezone 并替换 baseOpts.timestamp：

```ts
const timezone = loggerConf.timezone || 'UTC';
// ...
timestamp: timestamp ? buildTimezoneTimeFn(timezone) : false,
```

类型与默认值：
- `types/index.ts` 的 `LoggerConfig` 新增 `timezone?: string`（注释：默认 `'UTC'`，可设 `'Asia/Shanghai'` 等）
- `default_config.ts` 的 `logger` 加 `timezone: 'UTC'`

## 边界处理

- `timeZone === 'UTC'` → 走 `toISOString()` 快路径，输出严格 `Z` 后缀，性能也最好
- `longOffset` 在 UTC 下产出纯 `'GMT'` → 规整成 `+00:00`
- 个别 JS 引擎午夜小时返回 `'24'` → 规整成 `'00'`

## 验证

把机器时区强制为纽约（`TZ=America/New_York`），用编译后的 dist 实测：

```
默认(UTC):      ,"time":"2026-06-02T01:07:51.296Z"
Asia/Shanghai:  ,"time":"2026-06-02T09:07:51.310+08:00"
```

- 默认输出标准 UTC（带 `Z`），不随宿主机时区变化
- 显式设 `Asia/Shanghai` 输出上海挂钟时间（带 `+08:00`），同样不受宿主机 TZ 影响

## 用法

在 `cmd/bin.js` 的 `logger` 配置里设置：

```js
logger: {
  // 不设或 'UTC' → 标准 UTC（默认）
  timezone: 'Asia/Shanghai',   // → 文件日志输出本地时间带偏移
}
```
