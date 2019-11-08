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
			this.release(event.offsetX, event.offsetY);
		}
		document.onmousemove = event => {
			this.move(event.offsetX, event.offsetY);
		};

		document.ontouchstart = event => {
			if(event.touches[0] != null) {
				this.move(event.touches[0].clientX, event.touches[0].clientY);
			}
		};
		document.ontouchmove = event => { 
			if(!this.touchEnabled  && event.touches[0] != null) {
				this.touchEnabled = true;
			}
			this.move(event.touches[0].clientX, event.touches[0].clientY);
		};
		document.ontouchend = event => {
			if(this.touchEnabled && event.touches[0] != null) {
				this.release(event.touches[0].clientX, event.touches[0].clientY);
				this.touchEnabled = false;
			}
		}
	}

	public move(x: number, y: number): void {
		if(x <= dynamicCanvas.offsetLeft || x >= dynamicCanvas.offsetLeft + dynamicCanvas.width ||
			y <= dynamicCanvas.offsetTop || y >= dynamicCanvas.offsetTop + dynamicCanvas.height) {
			return null;
		}
		this.position.x = x - dynamicCanvas.offsetLeft;
		this.position.y = y - dynamicCanvas.offsetTop;
	}

	public release(x: number, y: number): void {
		if(x <= dynamicCanvas.offsetLeft || x >= dynamicCanvas.offsetLeft + dynamicCanvas.width ||
			y <= dynamicCanvas.offsetTop || y >= dynamicCanvas.offsetTop + dynamicCanvas.height) {
			return null;
		}
		if(gameState == null) {
			return;
		}
		if(gameState.status === 1 || gameState.playing) {
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