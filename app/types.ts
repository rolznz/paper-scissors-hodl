export const options = ["paper", "scissors", "rock"] as const;
export type Option = (typeof options)[number];

export type GameStatus = "win" | "lose" | "draw" | "pending";
export type GameResult = { status: GameStatus; options: Option[] };

export const GAME_AMOUNT_SATS = 1000;
export const WIN_AMOUNT_SATS = 1800;

export const APP_NAME = "Paper Scissors HODL";
