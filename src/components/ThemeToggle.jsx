import { useState, useEffect } from "react";

const THEMES = [
  { value: "dark", label: "Dark", emoji: "🌙", colors: ["#1d232a", "#a6adba", "#661ae6"] },
  { value: "light", label: "Light", emoji: "☀️", colors: ["#ffffff", "#1f2937", "#570df8"] },
  { value: "synthwave", label: "Synthwave", emoji: "🌆", colors: ["#1a103d", "#f9f7fd", "#e779c1"] },
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🤖", colors: ["#ffee00", "#333", "#ff7598"] },
  { value: "dracula", label: "Dracula", emoji: "🧛", colors: ["#282a36", "#f8f8f2", "#ff79c6"] },
  { value: "forest", label: "Forest", emoji: "🌲", colors: ["#171212", "#cbc9c9", "#1eb854"] },
  { value: "aqua", label: "Aqua", emoji: "💧", colors: ["#345da7", "#e3ebf8", "#09ecf3"] },
  { value: "night", label: "Night", emoji: "🌃", colors: ["#0f1729", "#b3c5ef", "#38bdf8"] },
  { value: "retro", label: "Retro", emoji: "📺", colors: ["#e4d8b4", "#282425", "#ef9995"] },
  { value: "valentine", label: "Valentine", emoji: "💕", colors: ["#f0d6e8", "#632c3b", "#e96d7b"] },
  { value: "halloween", label: "Halloween", emoji: "🎃", colors: ["#212121", "#f8f8f2", "#f28c18"] },
  { value: "garden", label: "Garden", emoji: "🌷", colors: ["#e9e7e7", "#100f0f", "#5c7f67"] },
  { value: "lofi", label: "Lo-Fi", emoji: "🎵", colors: ["#ffffff", "#000000", "#808080"] },
  { value: "pastel", label: "Pastel", emoji: "🎨", colors: ["#ffffff", "#333", "#d1c1d7"] },
  { value: "wireframe", label: "Wireframe", emoji: "📐", colors: ["#ffffff", "#000000", "#b8b8b8"] },
  { value: "luxury", label: "Luxury", emoji: "💎", colors: ["#09090b", "#dca54c", "#ffffff"] },
  { value: "business", label: "Business", emoji: "💼", colors: ["#ffffff", "#1c4e80", "#7c909a"] },
  { value: "coffee", label: "Coffee", emoji: "☕", colors: ["#20161f", "#756454", "#db924b"] },
  { value: "winter", label: "Winter", emoji: "❄️", colors: ["#e8f0f8", "#394e6a", "#047aff"] },
  { value: "dim", label: "Dim", emoji: "🔅", colors: ["#2a303c", "#b2ccd6", "#9fe88d"] },
  { value: "nord", label: "Nord", emoji: "🏔️", colors: ["#242933", "#d8dee9", "#5e81ac"] },
  { value: "sunset", label: "Sunset", emoji: "🌅", colors: ["#1a1634", "#9fb9d0", "#ff865b"] },
  { value: "acid", label: "Acid", emoji: "🧪", colors: ["#fafafa", "#333", "#d0ff00"] },
  { value: "lemonade", label: "Lemonade", emoji: "🍋", colors: ["#ffffff", "#333", "#519903"] },
];

/**
 * ThemeToggle — Expanded DaisyUI theme switcher with 24 themes.
 * Features:
 * - Live color swatch preview for each theme
 * - Current theme highlighted with checkmark
 * - Persisted in localStorage
 * - Grouped into Dark & Light categories
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("devtinder-theme") || "dark";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("devtinder-theme", theme);
  }, [theme]);

  const handleSelect = (value) => {
    setTheme(value);
    setIsOpen(false);
    // Blur the button to close DaisyUI dropdown
    document.activeElement?.blur();
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-circle"
        aria-label="Change theme"
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
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

      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-64 p-3 shadow-xl max-h-80 overflow-y-auto"
        role="menu"
        aria-label="Theme options"
      >
        <h3 className="text-xs font-semibold opacity-60 mb-2 px-1">Choose Theme</h3>

        <div className="grid grid-cols-1 gap-1">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleSelect(t.value)}
              role="menuitem"
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left w-full transition-colors hover:bg-base-300 ${
                theme === t.value ? "bg-primary/10 ring-1 ring-primary/30" : ""
              }`}
              aria-current={theme === t.value ? "true" : undefined}
            >
              {/* Color swatch preview */}
              <div className="flex gap-0.5 flex-shrink-0" aria-hidden="true">
                {t.colors.map((color, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-base-content/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Emoji + Label */}
              <span className="flex-1 text-sm flex items-center gap-1.5">
                <span aria-hidden="true">{t.emoji}</span>
                {t.label}
              </span>

              {/* Active indicator */}
              {theme === t.value && (
                <span className="text-primary text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Current theme indicator */}
        <div className="mt-2 pt-2 border-t border-base-content/10 px-1">
          <p className="text-[10px] opacity-40 text-center">
            Current: {THEMES.find((t) => t.value === theme)?.label || theme}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
