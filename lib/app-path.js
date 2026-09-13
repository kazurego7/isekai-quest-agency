export const appBasePath = import.meta.env.VITE_QUEST_BASE_PATH || "";
export function appPath(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || !appBasePath || path === appBasePath || path.startsWith(appBasePath + "/")) return path;
  return appBasePath + path;
}
export function appFetch(path, options) { return fetch(appPath(path), options); }
