import { Board } from "./board";
import { gameState } from "./main";
import { Player } from "./player";

export class RecordingStep {
	public step: Array<Array<number>>;
	public player: Player;
	public line: number;
	public nextLine: number;
	public wrongLine: number;

	constructor(step: Array<Array<number>>, player?: Player, line?: number, wrongLine?: number) {
		this.step = step;
		this.player = player;
		this.line = line == null ? 0 : line + 1;
		this.wrongLine = wrongLine == null ? 0 : wrongLine + 1;
		this.nextLine = 0;
	}

	public vectorizeBoard(normalize?: boolean, delimiter?: string): string {
		let vectorizedBoard = "";
		delimiter = delimiter == null ? " " : delimiter;
		for(let i = 0; i < this.step.length; i++) {
			for(let j = 0; j < this.step[i].length; j++) {
				if(normalize) {
					vectorizedBoard += this.step[i][j] / 2;
				}
				else {
					vectorizedBoard += this.step[i][j];
				}
				if(i < this.step.length - 1 || j < this.step[i].length - 1) {
					vectorizedBoard += delimiter;
				}
			}
		}
		return vectorizedBoard;
	}
}

export class Recording {

	public history: Array<RecordingStep>;
	public player1: Player;
	public player2: Player;
	public winner: number;

	constructor() {
		this.init();
	}

	public init(player1?: Player, player2?: Player): void {
		this.player1 = player1;
		this.player2 = player2;
		this.winner = 0;
		this.history = new Array<RecordingStep>();
		this.add(new RecordingStep(Board.copy(gameState.board).get2Dboard()));
	}

	public add(step: RecordingStep, line?: number): void {
		line = line == null ? 0 : line;
		if(this.history.length > 0) {
			this.history[this.history.length-1].nextLine = line + 1;
		}
		this.history.push(step);
	}

	public serialize(normalize?: boolean, delimiter?: string): string {
		normalize = normalize == null ? false : normalize;
		delimiter = delimiter == null ? " " : delimiter;
		let json = "{\"winner\":"+this.winner+", ";
		json += "\"player1\":{\"name\":\""+this.player1.name+"\", \"nbPenalties\": "+this.player1.nbPenalties+"}, ";
		json += "\"player2\":{\"name\":\""+this.player2.name+"\", \"nbPenalties\": "+this.player2.nbPenalties+"}, ";
		json += "\"history\":[";
		for(let nstep = 1; nstep < this.history.length; nstep++) {
			const playerId = this.history[nstep].player == null ? 0 : this.history[nstep].player.id;
			const playerName = this.history[nstep].player == null ? "" : this.history[nstep].player.name;
			json += "{\"nstep\":"+nstep+",";
			json += "\"player\":"+playerId+",";
			json += "\"name\":\""+playerName+"\",";
			json += "\"line\":"+this.history[nstep].line+",";
			json += "\"wrongLine\":"+this.history[nstep].wrongLine+",";
			json += "\"nextLine\":"+this.history[nstep].nextLine+",";
			json += "\"step\":\"";
			for(let i = 0; i < this.history[nstep].step.length; i++) {
				for(let j = 0; j < this.history[nstep].step[i].length; j++) {
					if(normalize) {
						json += this.history[nstep].step[i][j] / 2;
					}
					else {
						json += this.history[nstep].step[i][j];
					}
					if(i < this.history[nstep].step.length - 1 || j < this.history[nstep].step[i].length - 1) {
						json += delimiter;
					}
				}
			}
			json += "\"}";
			if(nstep < this.history.length-1) {
				json += ",";
			}
		}
		json += "]}";

		return json;
	}

}