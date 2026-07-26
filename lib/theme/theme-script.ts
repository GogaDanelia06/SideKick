import { DEFAULT_THEME, THEME_STORAGE_KEY } from "./config";

export const themeScript = `(function(){try{
  var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  var system = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = stored || system || ${JSON.stringify(DEFAULT_THEME)};
}catch(e){
  document.documentElement.dataset.theme = ${JSON.stringify(DEFAULT_THEME)};
}})();`;
