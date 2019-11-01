import { canvasH, canvasW, dynamicCtx, renderer, eventManager, record, recording, gameState, recordGeneration } from "./main";
import { Board } from "./board";
import { Collision } from "./collision";
import { RecordingStep } from "./recording";
import $ from "jquery";
import { Timer } from "./timer";
import { TIMERS } from "./timers";
import { Player, PlayerType } from "./player";
import { PLAYERS } from "./players";

export class GameState {
	public board: Board;
	public players: Array<Player>;
	public currentPlayer: Player;
	public currentLineHovered: number;
	public status: number;
	public playTimer: Timer;

	constructor() {
		this.init();
	}

	public init() {
		(window as any).gameState = this;
		this.players = PLAYERS;
		this.currentPlayer = this.getPlayer(1);
		this.board = new Board(6, 7);
		this.currentLineHovered = 0;
		this.status = 0;
		this.playTimer = this.getTimer("play");
		this.playTimer.restart();
		renderer.hideRestarButton();
		if(recording != null) {
			renderer.updateRecording();
		}
	}

	public reinit() {
		if(record && recording != null) {
			recording.init();
		}
		this.init();
	}

	public update(): void {
		dynamicCtx.save();
		dynamicCtx.clearRect(0, 0, canvasW, canvasH);

		TIMERS.forEach(timer => timer.run());
		
		renderer.drawBoard(dynamicCtx);
		this.board.drawVictory(dynamicCtx);

		if(this.getPlayer(1).type === PlayerType.HUMAN || this.getPlayer(2).type === PlayerType.HUMAN) {
			this.lineSelection();
		}
		else {
			if(this.status === 0 && this.playTimer.nextTick()) {
				this.autoplayMlpRng(10);
			}
		}
		
		const self = this;
		window.requestAnimationFrame(() => self.update());
	}

	public autoplayRng() {
		const availableLines = this.getAvailableLines();
		const randomLine = availableLines[Math.floor(Math.random() * availableLines.length)];
		console.log("Random play: " + randomLine);
		this.play(gameState.currentPlayer, randomLine);
	}

	public autoplayMlp() {
		const currentStep = recording.history[recording.history.length-1].vectorizeBoard(false, ";");
		console.log(currentStep);

		$.post(this.currentPlayer.aiService, { player: this.currentPlayer.id, board: currentStep },
		function(data) {
			if(data.status !== "success") {
				console.error("Error: a problem occured during the training");
			}
			else {
				console.log("Prediction: "+ data.prediction + " >> " + data.confidence);
				const bestLine = data.prediction - 1;
				gameState.play(gameState.currentPlayer, bestLine);
			}
		});
	}

	public autoplayMlpRng(probability: number): void {
		const random = Math.floor(Math.random() * probability);
		if(random === 0) {
			this.autoplayRng();
		}
		else {
			this.autoplayMlp();
		}
	}

	public lineSelection(): void {
		for(let i = 0; i < this.board.nbCols; i++) {
			for(let j = 0; j < this.board.nbRows; j++) {
				const token = this.board.tokens[i][j];
				if(Collision.isCollisionMouseRectlangle(eventManager.position.x, eventManager.position.y, token.rect)) {
					this.currentLineHovered = i;
					if([0, 3, 4].includes(token.value)) {
						this.board.tokens[i][0].value = this.currentPlayer.id + 2;
					}
				}
				else {
					if(token.value === 3 || token.value === 4) {
						this.board.tokens[i][0].value = 0;
					}
				}
			}
		}
	}

	public getAvailableLines(board?: Board): Array<number> {
		board = board == null ? this.board : board;
		const availableLines = new Array<number>();
		for(let i = 0; i < board.tokens.length; i++) {
			if([0, 3, 4].includes(board.tokens[i][0].value)) {
				availableLines.push(i);
			}
		}
		return availableLines;
	}

	public play(player: Player, line: number): void {
		const nextRow = this.board.nextRow(line);
		if(nextRow === -1) {
			return;
		}
		this.board.tokens[line][nextRow].value = player.id;

		if(record) {
			recording.add(new RecordingStep(Board.copy(this.board).get2Dboard(), player, line), line);
		}

		if(this.board.isDraw()) {
			renderer.showRestarButton;
			return;
		}

		const check = this.board.check(this.currentPlayer);
		if(check) {
			this.win(player);
			return;
		}

		renderer.updateRecording();

		this.togglePlayer();
	}

	public win(player: Player): void {
		recording.winner = player;
		const json = recording.serialize(false, ";");
		this.status = 1;

		console.log(recording);
		console.log(json);

		renderer.updateRecording();

		renderer.showRestarButton();
		
		if(!recordGeneration) {
			return;
		}

		$.post("http://127.0.0.1:8080/service/generate", { json: json },
			function(data) {
			console.log(data);
			// gameState.reinit();
		}).fail(function() {
			console.log("Error: The server isn't responding");
		});
	}

	public togglePlayer(): void {
		this.currentPlayer = this.currentPlayer.id === 1 ? this.getPlayer(2) : this.getPlayer(1);
	}

	public getPlayer(id: number): Player {
		if(id === 1) {
			return this.players[0];
		}
		else {
			return this.players[1];
		}
	}

	public getOtherPlayer(): Player {
		return this.currentPlayer.id === 1 ? this.getPlayer(2) : this.getPlayer(1);
	}

	public getTimer(id: string): Timer {
		return TIMERS.find(item => item.id === id);
	}

}