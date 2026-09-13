import { spawnSync } from "node:child_process";
import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "./sites-env.mjs";

function build(local) {
  const env = { ...process.env, VITE_QUEST_BASE_PATH: local ? "/isekai" : "", VITE_QUEST_LOCAL_RUNTIME: local ? "true" : "false" };
  const result = spawnSync(process.execPath, ["scripts/run-framework.mjs", "build"], { cwd: projectRoot, env, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${local ? "Local" : "Hosted"} build failed`);
}
// Keep the local artifact outside dist so Sites only packages a normal hosted build.
const target = path.join(projectRoot, ".local/tailscale-build");
try {
build(true);
await mkdir(target, { recursive: true });
await cp(path.join(projectRoot, "dist/server"), path.join(target, "server"), { recursive: true });
await cp(path.join(projectRoot, "dist/client"), path.join(target, "client"), { recursive: true });
await writeFile(path.join(target, "runtime.json"), JSON.stringify({ basePath: "/isekai", local: true, builtAt: new Date().toISOString() }));
} finally {
// Even if local compilation or copying fails, never leave a local-auth build in dist.
build(false);
}
console.log("Local optimized build: .local/tailscale-build; hosted build: dist");
