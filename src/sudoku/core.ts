// Core Sudoku logic: board representation, solver, generator with difficulty
// Board indices: row 0-8, col 0-8. Empty cell represented by 0.

export type CellValue = number; // 0-9 where 0 = empty
export type Board = CellValue[][]; // 9x9

export interface Puzzle {
	puzzle: Board; // with zeros for blanks
	solution: Board; // full solved board
	difficulty: DifficultyLevel;
}

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export const DIFFICULTY_CONFIG: Record<
	DifficultyLevel,
	{
		minGiven: number;
		maxGiven: number;
		maxAttempts: number;
		description: string;
	}
> = {
	EASY: {
		minGiven: 36,
		maxGiven: 40,
		maxAttempts: 3,
		description: "Good for beginners",
	},
	MEDIUM: {
		minGiven: 32,
		maxGiven: 35,
		maxAttempts: 5,
		description: "Moderate challenge",
	},
	HARD: {
		minGiven: 28,
		maxGiven: 31,
		maxAttempts: 7,
		description: "For experienced players",
	},
	EXPERT: {
		minGiven: 24,
		maxGiven: 27,
		maxAttempts: 9,
		description: "Very few givens, can require advanced strategies",
	},
};

export function emptyBoard(): Board {
	return Array.from({ length: 9 }, () => Array<CellValue>(9).fill(0));
}

export function cloneBoard(b: Board): Board {
	return b.map((r) => [...r]);
}

export function isValidPlacement(
	board: Board,
	row: number,
	col: number,
	value: number,
): boolean {
	for (let c = 0; c < 9; c++) if (board[row][c] === value) return false;
	for (let r = 0; r < 9; r++) if (board[r][col] === value) return false;
	const boxRow = Math.floor(row / 3) * 3;
	const boxCol = Math.floor(col / 3) * 3;
	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 3; c++) {
			if (board[boxRow + r][boxCol + c] === value) return false;
		}
	}
	return true;
}

// Backtracking solver. If countSolutions is true, finds up to 2 solutions (for uniqueness test)
export function solve(
	board: Board,
	countSolutions = false,
): { solved: boolean; solutions?: number } {
	const b = cloneBoard(board);
	let solutions = 0;

	function backtrack(): boolean {
		let row = -1,
			col = -1;
		let minOptions = 10;
		// simple heuristic: choose cell with least candidates
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				if (b[r][c] === 0) {
					const opts: number[] = [];
					for (let v = 1; v <= 9; v++)
						if (isValidPlacement(b, r, c, v)) opts.push(v);
					if (opts.length < minOptions) {
						minOptions = opts.length;
						row = r;
						col = c;
						if (minOptions === 1) break;
					}
				}
			}
			if (minOptions === 1) break;
		}
		if (row === -1) {
			// solved
			solutions++;
			return true;
		}
		const candidates: number[] = [];
		for (let v = 1; v <= 9; v++)
			if (isValidPlacement(b, row, col, v)) candidates.push(v);
		shuffleInPlace(candidates);
		for (const v of candidates) {
			b[row][col] = v;
			if (backtrack()) {
				if (!countSolutions) return true;
				if (countSolutions && solutions > 1) return true; // early exit if more than one
			}
			b[row][col] = 0;
		}
		return false;
	}

	const solved = backtrack();
	if (!countSolutions) {
		if (solved) {
			// copy solved back into original board reference
			for (let r = 0; r < 9; r++)
				for (let c = 0; c < 9; c++) board[r][c] = b[r][c];
		}
		return { solved };
	}
	return { solved: solutions > 0, solutions };
}

function shuffleInPlace<T>(arr: T[]): void {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}

// Generate a full solved board first, then remove cells while ensuring uniqueness.
export function generatePuzzle(difficulty: DifficultyLevel): Puzzle {
	const config = DIFFICULTY_CONFIG[difficulty];
	const full = emptyBoard();
	fillBoard(full);
	const solution = cloneBoard(full);
	const puzzle = carvePuzzle(
		full,
		config.minGiven,
		config.maxGiven,
		config.maxAttempts,
	);
	return { puzzle, solution, difficulty };
}

function fillBoard(board: Board): boolean {
	// fill using backtracking with randomized candidate order
	function nextCell(): [number, number] | null {
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) if (board[r][c] === 0) return [r, c];
		}
		return null;
	}
	const cell = nextCell();
	if (!cell) return true;
	const [row, col] = cell;
	const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	shuffleInPlace(candidates);
	for (const v of candidates) {
		if (isValidPlacement(board, row, col, v)) {
			board[row][col] = v;
			if (fillBoard(board)) return true;
			board[row][col] = 0;
		}
	}
	return false;
}

function carvePuzzle(
	board: Board,
	minGiven: number,
	maxGiven: number,
	maxAttempts: number,
): Board {
	const targetGiven = randInt(minGiven, maxGiven);
	const cells = Array.from({ length: 81 }, (_, i) => i);
	shuffleInPlace(cells);
	let attempts = 0;
	while (
		cells.length &&
		countFilled(board) > targetGiven &&
		attempts < maxAttempts * 81
	) {
		const popped = cells.pop();
		if (popped === undefined) break;
		const idx = popped;
		const r = Math.floor(idx / 9);
		const c = idx % 9;
		const backup = board[r][c];
		board[r][c] = 0;
		const { solutions } = solve(board, true);
		if (!solutions || solutions !== 1) {
			board[r][c] = backup; // revert
		}
		attempts++;
	}
	return cloneBoard(board);
}

function countFilled(board: Board): number {
	let count = 0;
	for (let r = 0; r < 9; r++)
		for (let c = 0; c < 9; c++) if (board[r][c] !== 0) count++;
	return count;
}

function randInt(min: number, max: number): number {
	// inclusive
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isComplete(board: Board): boolean {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			if (board[r][c] === 0) return false;
		}
	}
	return true;
}

export function boardEquals(a: Board, b: Board): boolean {
	for (let r = 0; r < 9; r++)
		for (let c = 0; c < 9; c++) if (a[r][c] !== b[r][c]) return false;
	return true;
}
