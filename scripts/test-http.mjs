import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL を設定してください。");
const database = new URL(databaseUrl);
if (!["127.0.0.1", "localhost"].includes(database.hostname) || !database.pathname.endsWith("_test")) {
  throw new Error("ローカル環境の、名前が _test で終わる専用DBが必要です。");
}

// Use a separate port and explicit environment so the development DB is untouched.
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
const baseUrl = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: databaseUrl,
  TEST_BASE_URL: baseUrl,
  NEXTAUTH_URL: baseUrl,
  NEXTAUTH_SECRET: randomBytes(32).toString("hex"),
};
const require = createRequire(import.meta.url);
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env, stdio: "inherit", windowsHide: true,
});
const serverExit = once(server, "exit");
let spawnError;
server.on("error", (error) => { spawnError = error; });
// Handle startup failures even before the finally block awaits shutdown.
serverExit.catch(() => {});

try {
  const deadline = Date.now() + 90_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null || server.signalCode !== null) throw new Error("テスト用サーバーが終了しました。");
    try {
      const response = await fetch(`${baseUrl}/api/auth/csrf`, { signal: AbortSignal.timeout(2000) });
      ready = response.ok && typeof (await response.json()).csrfToken === "string";
    } catch { /* Wait for startup. */ }
    if (ready) break;
    await delay(250);
  }
  if (!ready) throw new Error("テスト用サーバーの起動がタイムアウトしました。");
  const tests = spawn(process.execPath, ["--test", "tests/quest-flow.test.mjs"], {
    env, stdio: "inherit", windowsHide: true, timeout: 300_000,
  });
  const [code] = await once(tests, "exit");
  process.exitCode = code ?? 1;
} finally {
  if (server.exitCode === null && server.signalCode === null) server.kill();
  await serverExit;
}
