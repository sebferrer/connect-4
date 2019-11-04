import { canvasH, canvasW, dynamicCtx, renderer, eventManager, record, recording, gameState, recordGeneration } from "./main";
import { Board } from "./board";
import { Collision } from "./collision";
import { RecordingStep } from "./recording";
import $ from "jquery";
import { Timer } from "./timer";
import { TIMERS } from "./timers";
import { Player, PlayerType } from "./player";
import { PLAYERS, Players } from "./players";
import { GameMode, GameModeUtil } from "./gameMode";
import { Token } from "./token";

export class GameState {
	public board: Board;
	public players: Array<Player>;
	public currentPlayer: Player;
	public currentLineHovered: number;
	public status: number;
	public playTimer: Timer;
	public gameMode: GameMode;
	public lastMove: Token;

	constructor() {
		(window as any).gameState = this;
		this.init();
	}

	public init(mode?: string) {
		if(mode == null) {
			if(this.gameMode == null) {
				this.gameMode = GameMode.HUMAN_HUMAN;
			}
		}
		else {
			this.gameMode = GameModeUtil.getGameMode(mode);
		}
		this.players = this.gameMode == null ? PLAYERS : Players.getPlayersByMode(this.gameMode);
		this.currentPlayer = this.getPlayer(1);
		this.board = new Board(6, 7);
		this.currentLineHovered = 0;
		this.status = 0;
		this.lastMove = null;
		this.playTimer = this.getTimer("play");
		this.playTimer.restart();
		renderer.hideRestarButton();
		renderer.hideBackMenuButton();
		if(record && recording != null) {
			recording.init();
			renderer.updateRecording();
		}
		if(gameState != null && gameState.currentPlayer.type === PlayerType.AI) {
			gameState.play(gameState.currentPlayer, 3);
		}
	}

	public reinit(mode) {
		this.init(mode);
	}

	public menu() {
		renderer.showMenu();
		renderer.hideGame();
	}

	public update(): void {
		dynamicCtx.save();
		dynamicCtx.clearRect(0, 0, canvasW, canvasH);

		TIMERS.forEach(timer => timer.run());
		
		renderer.drawBoard(dynamicCtx);
		this.board.drawVictory(dynamicCtx);
		this.board.drawLastMove(this.lastMove, dynamicCtx);

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
		this.play(this.currentPlayer, randomLine);
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
				let bestLine = data.prediction - 1;
				let availableLines = gameState.availableLines();
				if(!availableLines.includes(bestLine)) {
					gameState.currentPlayer.addPenalty();
					bestLine = availableLines[Math.floor(Math.random() * availableLines.length)];
				}
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

	public availableLines(board?: Board): Array<number> {
		board = board == null ? this.board : board;
		let availableLines = new Array<number>();
		for(let i = 0; i < board.tokens.length; i++) {
			if([0, 3, 4].includes(board.tokens[i][0].value)) {
				availableLines.push(i);
			}
		}
		return availableLines;
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

		this.lastMove = this.board.tokens[line][nextRow];

		renderer.updateRecording();

		if(this.board.isDraw()) {
			this.status = 1;
			renderer.showRestarButton();
			renderer.showBackMenuButton();
			return;
		}

		const check = this.board.check(this.currentPlayer);
		if(check) {
			this.win(player);
			return;
		}

		this.togglePlayer();
	}

	public win(player: Player): void {
		recording.winner = player;
		const json = recording.serialize(false, ";");
		this.status = 1;

		console.log(recording);
		console.log(json);

		renderer.showRestarButton();
		renderer.showBackMenuButton();
		
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

	public startMode(mode: string): void {
		renderer.showGame();
		renderer.hideMenu();
		gameState.reinit(mode);
	}

}