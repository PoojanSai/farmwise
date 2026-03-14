import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { FiGlobe, FiChevronDown, FiCheck } from "react-icons/fi";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు",  flag: "🇮🇳" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger button */}
      <button
        id="language-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        title="Change Language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "10px",
          border: "1.5px solid rgba(22,163,74,0.3)",
          background: "rgba(22,163,74,0.07)",
          color: "#15803d",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(22,163,74,0.15)";
          e.currentTarget.style.borderColor = "rgba(22,163,74,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(22,163,74,0.07)";
          e.currentTarget.style.borderColor = "rgba(22,163,74,0.3)";
        }}
      >
        <FiGlobe size={14} />
        <span>{current.flag} {current.label}</span>
        <FiChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "160px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            zIndex: 9999,
            animation: "langDropIn 0.15s ease",
          }}
        >
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-option-${lang.code}`}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 14px",
                  background: isActive ? "rgba(22,163,74,0.08)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#15803d" : "#374151",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.label}</span>
                {isActive && <FiCheck size={13} color="#15803d" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Keyframe for dropdown animation */}
      <style>{`
        @keyframes langDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
