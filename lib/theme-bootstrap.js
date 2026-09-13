// Only a validated enum is inserted into the pre-paint script.
export function themeBootstrap(preference) {
  const value = ["light", "dark"].includes(preference) ? preference : "system";
  return `(()=>{const p=${JSON.stringify(value)};const d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.add(d?'dark':'light');document.documentElement.style.colorScheme=d?'dark':'light'})()`;
}
