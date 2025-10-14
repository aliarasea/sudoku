import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";

interface GameTimerProps {
	startTime: number; // epoch ms when game started
	completed: boolean; // whether puzzle is finished
	elapsedCompleted: number; // elapsed ms when completed
	difficulty: string; // difficulty key
}

function format(ms: number): string {
	const totalSec = Math.floor(ms / 1000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	if (h > 0)
		return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const GameTimer = ({
	startTime,
	completed,
	elapsedCompleted,
	difficulty,
}: GameTimerProps) => {
	const { t } = useI18n();
	const [now, setNow] = useState(Date.now());
	const rafRef = useRef<number | null>(null);
	const lastUpdateRef = useRef(0);

	// Best time per difficulty stored in localStorage
	const storageKey = `bestTime_${difficulty}`;
	const [bestTime, setBestTime] = useState<number | null>(() => {
		if (typeof localStorage === "undefined") return null;
		const raw = localStorage.getItem(storageKey);
		if (!raw) return null;
		const val = parseInt(raw, 10);
		return Number.isFinite(val) ? val : null;
	});

	useEffect(() => {
		if (!completed) return;
		if (typeof localStorage === "undefined") return;
		setBestTime((prev) => {
			if (prev == null || elapsedCompleted < prev) {
				localStorage.setItem(storageKey, String(elapsedCompleted));
				return elapsedCompleted;
			}
			return prev;
		});
	}, [completed, elapsedCompleted, storageKey]);

	useEffect(() => {
		if (completed) return; // stop ticking
		const tick = (ts: number) => {
			// Throttle to ~1 update / sec
			if (ts - lastUpdateRef.current >= 950) {
				setNow(Date.now());
				lastUpdateRef.current = ts;
			}
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [completed]);

	// Pause when page hidden (saves battery)
	useEffect(() => {
		const visHandler = () => {
			if (document.hidden && rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			} else if (!document.hidden && !completed && !rafRef.current) {
				lastUpdateRef.current = 0;
				rafRef.current = requestAnimationFrame((ts) => {
					lastUpdateRef.current = ts;
					setNow(Date.now());
					rafRef.current = requestAnimationFrame(function loop(innerTs) {
						if (innerTs - lastUpdateRef.current >= 950) {
							setNow(Date.now());
							lastUpdateRef.current = innerTs;
						}
						rafRef.current = requestAnimationFrame(loop);
					});
				});
			}
		};
		document.addEventListener("visibilitychange", visHandler);
		return () => document.removeEventListener("visibilitychange", visHandler);
	}, [completed]);

	const elapsed = completed ? elapsedCompleted : now - startTime;

	return (
		<div className="game-timer" aria-live="polite">
			<span className="current">
				⏱ {t("TIME")}: {format(elapsed)}
			</span>
			{bestTime != null && (
				<span className="best" title={t("BEST_TIME_TOOLTIP")}>
					• {t("BEST_TIME")}: {format(bestTime)}
				</span>
			)}
			{completed && bestTime != null && elapsedCompleted <= bestTime && (
				<span className="badge new-best">{t("NEW_BEST")}</span>
			)}
		</div>
	);
};
