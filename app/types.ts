export const options = ["paper", "scissors", "rock"] as const;
export type Option = (typeof options)[number];

export type GameResult = "win" | "lose" | "draw" | "pending";

export const GAME_AMOUNT_SATS = 1000;
export const WIN_AMOUNT_SATS = 1800;
