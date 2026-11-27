/**
 * CS-21: dark-theme bootstrap extracted from an inline <script> so the CSP can
 * ship without `'unsafe-inline'` in `script-src`.
 */
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var isDark =
      saved === "dark" ||
      (!saved &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  } catch (e) {
    /* ignore storage/matchMedia errors */
  }
})();
