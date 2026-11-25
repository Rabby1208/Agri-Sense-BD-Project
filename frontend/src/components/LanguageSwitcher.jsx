
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  };

  return (
    <div className="language-switcher">
      <Languages size={17} aria-hidden="true" />

      <span className="language-label">
        {t("language")}:
      </span>

      <button
        type="button"
        className={i18n.language === "en" ? "language-option active" : "language-option"}
        onClick={() => changeLanguage("en")}
        aria-pressed={i18n.language === "en"}
      >
        English
      </button>

      <span aria-hidden="true">|</span>

      <button
        type="button"
        className={i18n.language === "bn" ? "language-option active" : "language-option"}
        onClick={() => changeLanguage("bn")}
        aria-pressed={i18n.language === "bn"}
      >
        বাংলা
      </button>
    </div>
  );
}

export default LanguageSwitcher;
