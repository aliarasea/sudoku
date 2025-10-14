import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./i18n";

const rootEl = document.getElementById("root");
if (rootEl) {
	createRoot(rootEl).render(
		<StrictMode>
			<I18nProvider initialLocale="tr">
				<App />
			</I18nProvider>
		</StrictMode>,
	);
} else {
	// eslint-disable-next-line no-console
	console.error("Root element #root not found");
}
