import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import en from "./assets/locales/en/translations.json";
import tr from "./assets/locales/tr/translations.json";

export type Locale = "en" | "tr";

interface Messages {
	[key: string]: string;
}

const messages: Record<Locale, Messages> = {
	en: en,
	tr: tr,
};

interface I18nContextValue {
	locale: Locale;
	t: (key: string) => string;
	setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{
	initialLocale?: Locale;
	children: React.ReactNode;
}> = ({ initialLocale, children }) => {
	const detect = useCallback((): Locale => {
		if (initialLocale) return initialLocale;
		const stored =
			typeof localStorage !== "undefined"
				? (localStorage.getItem("locale") as Locale | null)
				: null;
		if (stored && (stored === "en" || stored === "tr")) return stored;
		const nav = typeof navigator !== "undefined" ? navigator.language : "en";
		if (nav.startsWith("tr")) return "tr";
		return "en";
	}, [initialLocale]);

	const [locale, setLocaleState] = useState<Locale>(detect);

	const setLocale = useCallback((l: Locale) => {
		setLocaleState(l);
		try {
			localStorage.setItem("locale", l);
		} catch {
			/* ignore */
		}
	}, []);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const t = useCallback(
		(key: string) => {
			const dict = messages[locale];
			return dict[key] || messages.en[key] || key;
		},
		[locale],
	);

	const value = useMemo(
		() => ({ locale, t, setLocale }),
		[locale, t, setLocale],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error("useI18n must be used within I18nProvider");
	return ctx;
}

export function formatDifficultyKey(diff: string) {
	return `DIFFICULTY_${diff}`;
}
