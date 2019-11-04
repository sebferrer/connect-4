import { Player, PlayerType } from "./player";
import { GameMode } from "./gameMode";

export const PLAYERS: Player[] = [
	new Player(PlayerType.HUMAN, 1),
	new Player(PlayerType.HUMAN, 2)
];

export class Players {

	public static getPlayersByMode(gameMode): Array<Player> {
		let players: Array<Player>;
			switch(gameMode) {
				case GameMode.HUMAN_HUMAN:
					players = [
						new Player(PlayerType.HUMAN, 1),
						new Player(PlayerType.HUMAN, 2)
					];
					break;
				case GameMode.HUMAN_AI:
					players = [
						new Player(PlayerType.HUMAN, 1),
						new Player(PlayerType.AI, 2, "164.132.97.208:5001/mlp/predict")
					];
					break;
				case GameMode.AI_HUMAN:
					players = [
						new Player(PlayerType.AI, 1, "164.132.97.208:5001/mlp/predict"),
						new Player(PlayerType.HUMAN, 2)
					];
					break;
				case GameMode.AI_AI:
					players = [
						new Player(PlayerType.AI, 1, "164.132.97.208:5001/mlp/predict"),
						new Player(PlayerType.AI, 2, "164.132.97.208:5001/mlp/predict")
					];
					break;
			}
		return players;
	}

}