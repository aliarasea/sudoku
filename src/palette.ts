// Programmatic color palette for use in TS/JS (e.g., styled-components, inline styles)
// Mirrors the tokens defined in theme.css

export const palette = {
	blue: { 50: "#E5F8FD", 400: "#27BDF2", 500: "#00AEEF", 600: "#0099D6" },
	yellow: { 500: "#FFC400" },
	green: { 500: "#32C671" },
	red: { 500: "#FF4D4F" },
	orange: { 500: "#FF8A34" },
	purple: { 500: "#7E57C2" },
	gray: {
		50: "#F5F8FA",
		100: "#E9EFF3",
		200: "#D5DEE4",
		300: "#B6C2CC",
		400: "#91A0AD",
		500: "#6B7A86",
		600: "#4D5963",
		700: "#374048",
		800: "#24282D",
		900: "#1A1D21",
	},
	white: "#FFFFFF",
} as const;

export const semantic = {
	bg: "var(--color-bg)",
	bgMuted: "var(--color-bg-muted)",
	surface: "var(--color-surface)",
	surfaceAlt: "var(--color-surface-alt)",
	text: "var(--color-text)",
	textSecondary: "var(--color-text-secondary)",
	textInverse: "var(--color-text-inverse)",
	border: "var(--color-border)",
	borderStrong: "var(--color-border-strong)",
	brand: "var(--color-brand)",
	brandHover: "var(--color-brand-hover)",
	brandAccent: "var(--color-brand-accent)",
	info: "var(--color-info)",
	success: "var(--color-success)",
	warning: "var(--color-warning)",
	error: "var(--color-error)",
	focusShadow: "var(--shadow-focus)",
} as const;

export type Palette = typeof palette;
export type Semantic = typeof semantic;
