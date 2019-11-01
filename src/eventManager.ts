import { Point } from "./point";
import { dynamicCanvas, gameState } from "./main";
import { PlayerType } from "./player";

export class EventManager {
	public mousePos: Point;

	constructor() {
		this.mousePos = new Point();

		document.onmousedown = event => this.mouseDown(event);
		document.onmouseup = event => this.mouseUp(event);
		document.onmousemove = event => {
			this.mousePos.x = event.offsetX - dynamicCanvas.offsetLeft;
			this.mousePos.y = event.offsetY - dynamicCanvas.offsetTop;
		};
	}

	public mouseDown(event): void {
		// const x = event.offsetX;
		// const y = event.offsetY;
	}

	public mouseUp(event): void {
		// const x = event.offsetX;
		// const y = event.offsetY;
		if(gameState.status === 1) {
			return;
		}
		if(gameState.currentPlayer.type === PlayerType.AI && gameState.getOtherPlayer().type === PlayerType.AI) {
			return;
		}
		// gameState.autoplayMlpRng(10);
		// gameState.autoplayMlp();
		gameState.play(gameState.currentPlayer, gameState.currentLineHovered);
		if(gameState.currentPlayer.type === PlayerType.AI) {
			gameState.autoplayMlp();
		}
	}
	
}