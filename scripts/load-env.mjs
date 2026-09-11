import { existsSync } from "node:fs";
// Match Next.js precedence while preserving environment variables set by CI/tests.
for (const path of [".env.local", ".env"]) {
  if (existsSync(path)) process.loadEnvFile(path);
}
