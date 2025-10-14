import { useMemo } from "react";
import { useI18n } from "../i18n";
import type { Board } from "./core";

export interface SudokuBoardProps {
	puzzle: Board;
	working: Board;
	selected: { row: number; col: number } | null;
	conflicts: Set<string>;
	onSelect: (row: number, col: number) => void;
	onInput: (row: number, col: number, value: number | null) => void;
}

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
	puzzle,
	working,
	selected,
	conflicts,
	onSelect,
	onInput,
}) => {
	const { t } = useI18n();

	const cellIds = useMemo(
		() =>
			Array.from({ length: 9 }, (_, r) =>
				Array.from({ length: 9 }, (_, c) => `r${r}c${c}`),
			),
		[],
	);

	function handleKey(
		e: React.KeyboardEvent<HTMLButtonElement>,
		r: number,
		c: number,
	) {
		if (puzzle[r][c] !== 0) return; // given cell
		if (e.key === "Backspace" || e.key === "Delete") {
			onInput(r, c, null);
		} else if (/^[1-9]$/.test(e.key)) {
			onInput(r, c, parseInt(e.key, 10));
		}
	}

	return (
		<div className="sudoku-wrapper">
			<table
				className="sudoku-board"
				cellSpacing={0}
				cellPadding={0}
				aria-label="Sudoku board"
			>
				<tbody>
					{working.map((row, r) => (
						<tr key={cellIds[r][0]} className="sudoku-row">{/* stable row key based on first cell id */}
							{row.map((value, c) => {
								const isGiven = puzzle[r][c] !== 0;
								const isSelected = !!(
									selected &&
									selected.row === r &&
									selected.col === c
								);
								const conflict = conflicts.has(`${r}-${c}`);
								return (
									<td
										key={cellIds[r][c]}
										className={[
											"sudoku-cell",
											isGiven ? "given" : "editable",
											isSelected ? "selected" : "",
											conflict ? "conflict" : "",
											r % 3 === 0 ? "top-border" : "",
											c % 3 === 0 ? "left-border" : "",
											r === 8 ? "bottom-border" : "",
											c === 8 ? "right-border" : "",
										]
											.filter(Boolean)
											.join(" ")}
									>
										<button
											type="button"
											className="cell-btn"
											disabled={isGiven}
											data-selected={isSelected || undefined}
											data-conflict={conflict || undefined}
											onClick={() => onSelect(r, c)}
											onKeyDown={(e) => handleKey(e, r, c)}
										>
											{value !== 0 ? value : ""}
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
			<div className="sudoku-input-bar">
				{numbers.map((n) => (
					<button
						key={`n-${n}`}
						type="button"
						className="num-btn"
						onClick={() => selected && onInput(selected.row, selected.col, n)}
					>
						{n}
					</button>
				))}
				<button
					type="button"
					className="num-btn clear"
					onClick={() => selected && onInput(selected.row, selected.col, null)}
				>
					{t("CLEAR")}
				</button>
			</div>
		</div>
	);
};
