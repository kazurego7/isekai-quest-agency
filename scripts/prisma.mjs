import "./load-env.mjs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
const prismaPackage = require.resolve("prisma/package.json");
const cli = resolve(dirname(prismaPackage), require(prismaPackage).bin.prisma);
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: "inherit", env: process.env, windowsHide: true,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
