const STORAGE_KEY = "darkMode";
const CLASS_NAME = "darkmode";

export function themeInitScript() {
    return `(function(){try{var d=localStorage.getItem("${STORAGE_KEY}");var on=d==="enabled"||(d===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(on)document.body.classList.add("${CLASS_NAME}");}catch(e){}})();`;
}
