import { useState, useEffect } from "react";

const THEMES = [
  { value: "dark", label: "Dark", emoji: "🌙" },
  { value: "light", label: "Light", emoji: "☀️" },
  { value: "synthwave", label: "Synthwave", emoji: "🌆" },
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🤖" },
  { value: "dracula", label: "Dracula", emoji: "🧛" },
  { value: "forest", label: "Forest", emoji: "🌲" },
  { value: "aqua", label: "Aqua", emoji: "💧" },
  { value: "night", label: "Night", emoji: "🌃" },
];

/**
 * ThemeToggle - DaisyUI theme switcher persisted in localStorage.
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("devtinder-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("devtinder-theme", theme);
  }, [theme]);

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-circle"
        aria-label="Change theme"
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-44 p-2 shadow max-h-60 overflow-y-auto"
        role="menu"
        aria-label="Theme options"
      >
        {THEMES.map((t) => (
          <li key={t.value} role="none">
            <button
              onClick={() => setTheme(t.value)}
              role="menuitem"
              className={`flex items-center gap-2 ${
                theme === t.value ? "active" : ""
              }`}
              aria-current={theme === t.value ? "true" : undefined}
            >
              <span aria-hidden="true">{t.emoji}</span>
              {t.label}
              {theme === t.value && <span className="text-xs">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeToggle;
