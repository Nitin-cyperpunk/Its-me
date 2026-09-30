// The site's one theme mechanism: html[data-theme="light" | "dark"].
// The visitor's explicit choice is remembered; without one, the system setting
// decides (and is followed live). The hero and every scene after it recolour
// from tokens (app/globals.css, sections/scenes.module.css); the terminal intro
// and the footer each keep a single fixed look.

export type Theme = "light" | "dark";

export const THEME_KEY = "nitinverse-theme";

// Runs inline before first paint so the page never flashes the wrong theme.
export const themeScript = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;
