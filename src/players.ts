import { Player, PlayerType } from "./player";

export const PLAYERS: Player[] = [
	new Player(PlayerType.AI, 1, "164.132.97.208:5001/mlp/predict"),
	new Player(PlayerType.HUMAN, 2, "164.132.97.208:5001/mlp/predict")
];