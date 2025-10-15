import "./App.css";
import "./sudoku.css";
import { GameTimer } from "./components/GameTimer";
import { formatDifficultyKey, useI18n } from "./i18n";
import type { DifficultyLevel } from "./sudoku/core";
import { SudokuBoard } from "./sudoku/SudokuBoard";
import { useSudoku } from "./sudoku/useSudoku";

const difficulties: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];

function formatTime(ms: number): string {
	const sec = Math.floor(ms / 1000);
	const m = Math.floor(sec / 60)
		.toString()
		.padStart(2, "0");
	const s = (sec % 60).toString().padStart(2, "0");
	return `${m}:${s}`;
}

function App() {
	const { t, locale, setLocale } = useI18n();
	const {
		puzzle,
		working,
		selected,
		conflicts,
		difficulty,
		completed,
		elapsedMs,
		startTime,
		setDifficulty,
		place,
		select,
		reset,
		newGame,
		giveHint,
	} = useSudoku({ difficulty: "EASY" });

	return (
		<div className="app-shell">
			<header className="app-header">
				<table>
					<tbody>
						<tr>
							<td>
								<img src="/bip.png" alt="Sudoku Icon" />
							</td>
							<td>
								<h1>{t("TITLE")}</h1>
							</td>
						</tr>
					</tbody>
				</table>
				<br />
				<div className="controls-row">
					<label>
						{t("DIFFICULTY")}:{" "}
						<select
							value={difficulty}
							onChange={(e) => {
								setDifficulty(e.target.value as DifficultyLevel);
								newGame(e.target.value as DifficultyLevel);
							}}
						>
							{difficulties.map((d) => (
								<option key={d} value={d}>
									{t(formatDifficultyKey(d))}
								</option>
							))}
						</select>
					</label>
					<button type="button" onClick={() => newGame()}>
						{t("NEWGAME")}
					</button>
					<button type="button" onClick={reset}>
						{t("RESET")}
					</button>
					<button type="button" onClick={giveHint}>
						{t("HINT")}
					</button>
					<GameTimer
						startTime={startTime}
						completed={completed}
						elapsedCompleted={elapsedMs}
						difficulty={difficulty}
					/>
					<label>
						{t("LANGUAGE")}:{" "}
						<select
							value={locale}
							onChange={(e) => setLocale(e.target.value as "en" | "tr")}
						>
							<option value="en">English</option>
							<option value="tr">Türkçe</option>
						</select>
					</label>
				</div>
			</header>
			<main>
				<SudokuBoard
					puzzle={puzzle}
					working={working}
					selected={selected}
					conflicts={conflicts}
					onSelect={(r, c) => select(r, c)}
					onInput={(r, c, v) => place(r, c, v)}
				/>
				{completed && (
					<div className="game-complete" aria-live="polite">
						{t("COMPLETE_IN")} {formatTime(elapsedMs)} 🎉
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
