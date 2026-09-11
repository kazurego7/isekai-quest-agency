import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const baseUrl = process.env.TEST_BASE_URL;
const sessions = new AsyncLocalStorage();
if (!baseUrl) {
  // Exercise the real route handlers and Prisma transactions without a server.
  // Only the session provider is replaced; browser login must be tested separately.
  globalThis.__questTestSessions = sessions;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === "next-auth") {
        return { url: "data:text/javascript,export async function getServerSession(){return globalThis.__questTestSessions.getStore() ?? null}", shortCircuit: true };
      }
      if (specifier === "@/lib/auth-options") {
        return { url: "data:text/javascript,export const authOptions = {}", shortCircuit: true };
      }
      if (specifier.startsWith("@/")) {
        return nextResolve(pathToFileURL(resolve(specifier.slice(2) + ".js")).href, context);
      }
      if (specifier === "next/server") return nextResolve("next/server.js", context);
      return nextResolve(specifier, context);
    },
  });
}
const routes = {
  "/api/requests": "../app/api/requests/route.js",
  "/api/quests": "../app/api/quests/route.js",
  "/api/signup": "../app/api/signup/route.js",
  "/api/users": "../app/api/users/route.js",
  "/api/adventurers": "../app/api/adventurers/route.js",
};

export function client() {
  const cookies = new Map();
  let user = null;
  const call = async (path, method = "GET", body) => {
    const url = new URL(path, baseUrl || "http://localhost:3100");
    const init = {
      method, redirect: "manual",
      headers: { cookie: [...cookies].map(([key, value]) => key + "=" + value).join("; "),
        ...(body === undefined ? {} : { "Content-Type": body instanceof URLSearchParams ? "application/x-www-form-urlencoded" : "application/json" }) },
      body: body === undefined ? undefined : body instanceof URLSearchParams ? body.toString() : JSON.stringify(body),
    };
    let response;
    if (baseUrl) {
      response = await fetch(url, init);
    } else {
      const match = /^\/api\/(quests|requests)\/([^/]+)$/.exec(url.pathname);
      const modulePath = match ? "../app/api/" + match[1] + "/[id]/route.js" : routes[url.pathname];
      assert.ok(modulePath, "Unknown test route " + url.pathname);
      const handler = (await import(modulePath))[method];
      response = await sessions.run(user ? { user } : null, () =>
        handler(new Request(url, init), { params: Promise.resolve({ id: match?.[2] }) }));
    }
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      cookies.set(pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1));
    }
    const text = await response.text();
    assert.ok(!/"passwordHash"\s*:/.test(text), "API must not return password hashes");
    const data = response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : null;
    return { status: response.status, data, location: response.headers.get("location") };
  };
  call.setUser = (value) => { user = value; };
  return call;
}
