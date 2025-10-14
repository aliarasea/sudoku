import { useCallback, useEffect, useMemo, useState } from "react";
import type { Board, DifficultyLevel } from "./core";
import {
	boardEquals,
	cloneBoard,
	generatePuzzle,
	isComplete,
	isValidPlacement,
} from "./core";

export interface SudokuState {
	puzzle: Board; // starting puzzle with zero blanks
	working: Board; // user-modifiable board
	solution: Board; // full solution
	difficulty: DifficultyLevel;
	selected: { row: number; col: number } | null;
	conflicts: Set<string>; // key as r-c
	completed: boolean;
	startTime: number; // epoch ms
	elapsedMs: number; // updated when completed
}

export interface UseSudokuOptions {
	difficulty?: DifficultyLevel;
	autoGenerate?: boolean;
}

export interface UseSudokuAPI extends SudokuState {
	setDifficulty: (d: DifficultyLevel) => void;
	place: (row: number, col: number, value: number | null) => void;
	select: (row: number, col: number | null) => void;
	reset: () => void;
	newGame: (d?: DifficultyLevel) => void;
	giveHint: () => void;
}

export function useSudoku(options: UseSudokuOptions = {}): UseSudokuAPI {
	const { difficulty: initialDifficulty = "EASY", autoGenerate = true } =
		options;
	const [difficulty, setDifficulty] =
		useState<DifficultyLevel>(initialDifficulty);
	const [puzzle, setPuzzle] = useState<Board>(() => [] as unknown as Board);
	const [solution, setSolution] = useState<Board>(() => [] as unknown as Board);
	const [working, setWorking] = useState<Board>(() => [] as unknown as Board);
	const [selected, setSelected] = useState<SudokuState["selected"]>(null);
	const [conflicts, setConflicts] = useState<Set<string>>(new Set());
	const [completed, setCompleted] = useState(false);
	const [startTime, setStartTime] = useState(0);
	const [elapsedMs, setElapsedMs] = useState(0);

	const init = useCallback((d: DifficultyLevel) => {
		const { puzzle, solution } = generatePuzzle(d);
		setPuzzle(puzzle);
		setSolution(solution);
		setWorking(cloneBoard(puzzle));
		setSelected(null);
		setConflicts(new Set());
		setCompleted(false);
		setStartTime(Date.now());
		setElapsedMs(0);
	}, []);

	useEffect(() => {
		if (autoGenerate && (!puzzle || puzzle.length === 0)) {
			init(difficulty);
		}
	}, [autoGenerate, difficulty, init, puzzle]);

	const recomputeConflicts = useCallback((board: Board) => {
		const conflictKeys = new Set<string>();
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				const v = board[r][c];
				if (v === 0) continue;
				// Temporarily clear cell to test uniqueness
				board[r][c] = 0;
				if (!isValidPlacement(board, r, c, v)) {
					conflictKeys.add(`${r}-${c}`);
				}
				board[r][c] = v;
			}
		}
		setConflicts(conflictKeys);
	}, []);

	const place = useCallback(
		(row: number, col: number, value: number | null) => {
			if (puzzle[row][col] !== 0 || completed) return; // cannot modify given cells or finished game
			setWorking((prev) => {
				const next = cloneBoard(prev);
				next[row][col] = value ? value : 0;
				recomputeConflicts(next);
				if (isComplete(next) && boardEquals(next, solution)) {
					setCompleted(true);
					setElapsedMs(Date.now() - startTime);
				}
				return next;
			});
		},
		[completed, puzzle, recomputeConflicts, solution, startTime],
	);

	const select = useCallback((row: number, col: number | null) => {
		if (col === null) setSelected(null);
		else setSelected({ row, col });
	}, []);

	const reset = useCallback(() => {
		setWorking(cloneBoard(puzzle));
		setConflicts(new Set());
		setCompleted(false);
		setStartTime(Date.now());
		setElapsedMs(0);
	}, [puzzle]);

	const newGame = useCallback(
		(d?: DifficultyLevel) => {
			const diff = d || difficulty;
			setDifficulty(diff);
			init(diff);
		},
		[difficulty, init],
	);

	const giveHint = useCallback(() => {
		if (completed) return;
		// find a random empty cell and fill correct solution value
		const empties: [number, number][] = [];
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) if (working[r][c] === 0) empties.push([r, c]);
		}
		if (!empties.length) return;
		const [r, c] = empties[Math.floor(Math.random() * empties.length)];
		place(r, c, solution[r][c]);
	}, [completed, place, solution, working]);

	return useMemo(
		() => ({
			puzzle,
			working,
			solution,
			difficulty,
			selected,
			conflicts,
			completed,
			startTime,
			elapsedMs,
			setDifficulty,
			place,
			select,
			reset,
			newGame,
			giveHint,
		}),
		[
			puzzle,
			working,
			solution,
			difficulty,
			selected,
			conflicts,
			completed,
			startTime,
			elapsedMs,
			place,
			select,
			reset,
			newGame,
			giveHint,
		],
	);
}
