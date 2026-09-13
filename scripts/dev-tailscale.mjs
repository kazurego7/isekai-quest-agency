import { execFileSync } from "node:child_process";
const executable = process.platform === "win32" ? "C:/Program Files/Tailscale/tailscale.exe" : "tailscale";
const status = JSON.parse(execFileSync(executable, ["status", "--json"], { encoding: "utf8" }));
if (status.BackendState !== "Running") throw new Error("Tailscaleを接続してから起動してください。");
process.env.VITE_QUEST_BASE_PATH = "/isekai";
process.env.QUEST_TAILSCALE_HOST = status.Self.DNSName.replace(/\.$/, "");
process.argv = [process.execPath, process.argv[1], "dev", "--port", "5177"];
await import("./run-framework.mjs");
