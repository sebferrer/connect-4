import { canvasH, canvasW, dynamicCtx, renderer, eventManager, record, recording, gameState, recordGeneration, editAIServices, contest, IMAGE_BANK } from "./main";
import { Board } from "./board";
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
	public playing: boolean;

	constructor() {
		(window as any).gameState = this;
		this.init();
	}

	public init(mode?: string): void {
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
		if(editAIServices) {
			this.status = this.getPlayer(1).type === PlayerType.HUMAN ? 0 : 1;
		}
		else {
			this.status = 0;
		}
		this.lastMove = null;
		this.playing = false;
		this.playTimer = this.getTimer("play");
		this.playTimer.restart();
		renderer.hideRestarButton();
		renderer.hideBackMenuButton();
		if(record && recording != null) {
			recording.init(this.getPlayer(1), this.getPlayer(2));
			renderer.updateRecording();
		}
		if(this.gameMode !== GameMode.CONTEST) {
			renderer.hideContestVersus();
			if(!editAIServices && gameState != null && gameState.currentPlayer.type === PlayerType.AI) {
				gameState.autoplayMlp();
			}
		}
		else {
			renderer.setContestVersusPlayer1(this.getPlayer(1).name);
			renderer.setContestVersusPlayer2(this.getPlayer(2).name);
			renderer.showContestVersus();
		}

		if(this.getPlayer(1).type === PlayerType.AI) {
			$("#set-ai-start").show();
		}
	}

	public reinit(mode): void {
		this.init(mode);
	}

	public menu(): void {
		// renderer.showMenu();
		// renderer.hideGame();
		location.reload();
	}

	public update(): void {
		dynamicCtx.save();
		dynamicCtx.clearRect(0, 0, canvasW, canvasH);

		TIMERS.forEach(timer => timer.run());
		
		renderer.drawBoard(dynamicCtx);
		this.board.drawVictory(dynamicCtx);
		this.board.drawLastMove(this.lastMove, dynamicCtx);

		renderer.drawCorporate(dynamicCtx);

		if(this.getPlayer(1).type === PlayerType.HUMAN || this.getPlayer(2).type === PlayerType.HUMAN) {
			this.lineSelection();
		}
		else {
			if(this.status === 0 && this.playTimer.nextTick()) {
				if(this.gameMode === GameMode.AI_AI) {
					this.autoplayMlp();
				}
				else if(this.gameMode === GameMode.CONTEST) {
					this.autoplayContest();
				}
			}
		}
		
		const self = this;
		window.requestAnimationFrame(() => self.update());
	}

	public autoplayContest(): void {
		this.autoplayMlp();
	}

	public autoplayRng(): void {
		const availableLines = this.getAvailableLines();
		const randomLine = availableLines[Math.floor(Math.random() * availableLines.length)];
		console.log("Random play: " + randomLine);
		this.play(this.currentPlayer, randomLine);
	}

	public autoplayMlp(): void {
		if(this.playing || this.status === 1) {
			console.log("already playing");
			return;
		}

		this.playing = true;

		const currentStep = recording.history[recording.history.length-1].vectorizeBoard(false, ";");
		console.log(currentStep);

		let availableLines = this.availableLines();
		let wrongLine;
		let bestLine;

		let self = this;
		$.ajaxSetup({
			timeout: 5000
		});
		$.post(this.currentPlayer.aiService, { player: this.currentPlayer.id, board: currentStep },
		function(data) {
			console.log(JSON.stringify(data));

			if(!self.checkOutputConsistency(data.prediction, data.confidence)) {
				console.log("[PENALTY]: Bad AI outputs (prediction, confidence)");
				console.log("Prediction: " + data.prediction);
				console.log("Confidence: " + data.confidence);
				gameState.currentPlayer.addPenalty();
				bestLine = availableLines[Math.floor(Math.random() * availableLines.length)];
				gameState.play(gameState.currentPlayer, bestLine, -2);
				self.playTimer.restart();
				self.playing = false;
				return;
			}

			console.log("Prediction: "+ data.prediction + " >> " + data.confidence);

			bestLine = data.prediction - 1;
			if(!availableLines.includes(bestLine)) {
				console.error("[PENALTY]: tried to play in line " + bestLine);
				gameState.currentPlayer.addPenalty();
				wrongLine = bestLine;
				bestLine = availableLines[Math.floor(Math.random() * availableLines.length)];
			}
			gameState.play(gameState.currentPlayer, bestLine, wrongLine);

			self.playTimer.restart();
			self.playing = false;
		}).fail(function() {
			console.error("[PENALTY]: no AI answer");
			gameState.currentPlayer.addPenalty();
			bestLine = availableLines[Math.floor(Math.random() * availableLines.length)];
			gameState.play(gameState.currentPlayer, bestLine, -2);

			self.playTimer.restart();
			self.playing = false;
		});
	}

	public checkOutputConsistency(prediction, confidence): boolean {
		if(prediction == null || confidence == null) {
			console.error("Consistency error: prediction or confidence must not be null");
			console.log("Prediction: " + prediction);
			console.log("Confidence: " + confidence)
			return false;
		}
		else if(isNaN(prediction) || isNaN(confidence)) {
			console.error("Consistency error: prediction or confidence must be numbers");
			console.log("Prediction: " + prediction);
			console.log("Confidence: " + confidence)
			return false;
		}
		else if(!Number.isInteger(prediction)) {
			console.error("Consistency error: prediction must be an integer");
			console.log("Prediction: " + prediction);
			console.log("Confidence: " + confidence)
			return false;
		}
		if(prediction == null || confidence == null) {
			console.error("Consistency error: prediction or confidence must not be null");
			console.log("Prediction: " + prediction);
			console.log("Confidence: " + confidence)
			return false;
		}
		else if(confidence < 0 || confidence > 1) {
			console.error("Consistency error: confidence must be between 0 and 1");
			console.log("Prediction: " + prediction);
			console.log("Confidence: " + confidence)
			return false;
		}
		return true;
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
			let firstToken = this.board.tokens[i][0];
			if(eventManager.position.x >= firstToken.x * renderer.zoomScale &&
				eventManager.position.x <= (firstToken.x + firstToken.width) * renderer.zoomScale) {
				this.currentLineHovered = i;
				if([0, 3, 4].includes(firstToken.value)) {
					firstToken.value = this.currentPlayer.id + 2;
				}
			}
			else {
				if([3, 4].includes(firstToken.value)) {
					firstToken.value = 0;
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

	public play(player: Player, line: number, wrongLine?: number): void {
		this.playing = true;

		const nextRow = this.board.nextRow(line);
		if(nextRow === -1) {
			this.playing = false;
			return;
		}
		
		this.board.tokens[line][nextRow].value = player.id;

		if(record) {
			recording.add(new RecordingStep(Board.copy(this.board).get2Dboard(), player, line, wrongLine), line);
		}

		this.lastMove = this.board.tokens[line][nextRow];

		renderer.updateRecording();

		this.playing = false;

		if(this.board.isDraw()) {
			const json = recording.serialize(false, ";");

			this.generateRecording(json);
			
			if(this.gameMode === GameMode.CONTEST) {
				contest.getParticipantById(this.getPlayer(1).name).addPoints(1);
				contest.getParticipantById(this.getPlayer(2).name).addPoints(1);
				contest.getParticipantById(this.getPlayer(1).name).nbDraw++;
				contest.getParticipantById(this.getPlayer(2).name).nbDraw++;
			}

			this.end();
		}

		const check = this.board.check(this.currentPlayer);
		if(check) {
			this.win(player);
			return;
		}

		this.togglePlayer();
	}

	public end(): void {
		if(this.gameMode !== GameMode.CONTEST) {
			renderer.showRestarButton();
			renderer.showBackMenuButton();
		}
		else {
			contest.getParticipantById(this.getPlayer(1).name).addPenalties(this.getPlayer(1).nbPenalties);
			contest.getParticipantById(this.getPlayer(2).name).addPenalties(this.getPlayer(2).nbPenalties);
			contest.setNextRound();
			if(contest.finished) {
				this.status = 1;
				this.generateScoreboard(contest.serializeParticipants());
			}
			else {
				this.status = 1;
				setTimeout(() => this.reinit("contest"), 5000);
			}
		}
	}

	public win(player: Player): void {
		recording.winner = player.id;
		const json = recording.serialize(false, ";");
		this.status = 1;

		console.log(recording);
		console.log(json);

		if(this.gameMode === GameMode.CONTEST) {
			contest.getParticipantById(player.name).nbWin++;
			contest.getParticipantById(this.getOtherPlayer(player).name).nbLose++;
			contest.getParticipantById(player.name).addPoints(3);
		}

		this.end();
		
		this.generateRecording(json);
	}

	public generateRecording(json) {
		if(!recordGeneration) {
			return;
		}

		$.post("http://127.0.0.1:8080/service/generate_duel", { json: json },
			function(data) {
			console.log(data);
			// gameState.reinit();
		})

	}

	public generateScoreboard(json) {
		if(!recordGeneration) {
			return;
		}

		$.post("http://127.0.0.1:8080/service/generate_scoreboard", { json: json },
			function(data) {
			console.log(data);
		})
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

	public getOtherPlayer(player?: Player): Player {
		if(player == null) {
			return this.currentPlayer.id === 1 ? this.getPlayer(2) : this.getPlayer(1);
		}
		return player.id === 1 ? this.getPlayer(2) : this.getPlayer(1);
	}

	public getTimer(id: string): Timer {
		return TIMERS.find(item => item.id === id);
	}

	public startMode(mode: string): void {
		renderer.showGame();
		renderer.hideMenu();
		gameState.reinit(mode);
		renderer.scaleAIServices();
	}

	public setAI(): void {
		if(this.getPlayer(1).type === PlayerType.AI) {
			const currentPlayerSettedService = $("#ai1-text").val().toString();
			if(currentPlayerSettedService !== "") {
				this.getPlayer(1).aiService = currentPlayerSettedService;
				console.log("AI 1 set to " + currentPlayerSettedService);
			}
		}
		if(this.getPlayer(2).type === PlayerType.AI) {
			const currentPlayerSettedService = $("#ai2-text").val().toString();
			if(currentPlayerSettedService !== "") {
				this.getPlayer(2).aiService = currentPlayerSettedService;
				console.log("AI 2 set to " + currentPlayerSettedService);
			}
		}
	}

	public start(): void {
		if(this.getPlayer(1).type === PlayerType.AI && this.getPlayer(2).type !== PlayerType.AI) {
			this.status = 0;
			gameState.autoplayMlp();
		}
		else if(this.getPlayer(1).type === PlayerType.AI && this.getPlayer(2).type === PlayerType.AI) {
			this.status = 0;
		}
		$("#set-ai-start").hide();
	}

}