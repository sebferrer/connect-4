import { Point } from "./point";
import { dynamicCanvas, gameState } from "./main";
import { PlayerType } from "./player";

export class EventManager {
	public position: Point;
	public touchEnabled: boolean;

	constructor() {
		this.position = new Point();
		this.touchEnabled = false;

		document.onmouseup = event => {
			this.release();
		}
		document.onmousemove = event => {
			this.move(event.offsetX, event.offsetY);
		};

		document.ontouchstart = event => { 
			this.move(event.touches[0].clientX, event.touches[0].clientY);
		};
		document.ontouchmove = event => { 
			if(!this.touchEnabled) {
				this.touchEnabled = true;
			}
			this.move(event.touches[0].clientX, event.touches[0].clientY);
		};
		document.ontouchend = event => {
			if(this.touchEnabled) {
				this.release();
				this.touchEnabled = false;
			}
		}
	}

	public move(x, y): void {
		this.position.x = x - dynamicCanvas.offsetLeft;
		this.position.y = y - dynamicCanvas.offsetTop;
	}

	public release(): void {
		if(gameState.status === 1) {
			return;
		}
		if(gameState.currentPlayer.type === PlayerType.AI && gameState.getOtherPlayer().type === PlayerType.AI) {
			return;
		}
		gameState.play(gameState.currentPlayer, gameState.currentLineHovered);
		if(gameState.currentPlayer.type === PlayerType.AI) {
			gameState.autoplayMlp();
		}
	}
	
}