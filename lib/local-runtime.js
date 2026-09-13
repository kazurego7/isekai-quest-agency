// Replaced at build time. Hosted builds never enable local account switching.
export const isLocalRuntime = import.meta.env.DEV || import.meta.env.VITE_QUEST_LOCAL_RUNTIME === "true";
