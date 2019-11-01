import $ from "jquery";
import { canvasH, canvasW, mainLayers, gameState, recording } from "./main";

export class Renderer {
	public zoomScale: number;
	public zoomScaleNext: Map<number, number>;

	constructor() {
		this.zoomScale = 1;
		this.zoomScaleNext = new Map<number, number>([[1, 1.25], [1.25, 1.5], [1.5, 1.75], [1.75, 2], [2, 1]]);
	}

	public disableSmoothing(): void {
		mainLayers.forEach(layer => {
			layer.ctx["webkitImageSmoothingEnabled"] = false;
			layer.ctx["mozImageSmoothingEnabled"] = false;
			layer.ctx.imageSmoothingEnabled = false;
		});
	}

	public scale(zoomScale?: number): void {
		this.zoomScale = zoomScale == null ? this.zoomScaleNext.get(this.zoomScale) : zoomScale;
		mainLayers.forEach(layer => {
			layer.canvas.width = canvasW * this.zoomScale;
			layer.canvas.height = canvasH * this.zoomScale;
			layer.ctx.scale(this.zoomScale, this.zoomScale);
		});
		this.disableSmoothing();
	}

	public autoScale(): void {
		this.scale(Math.round(window.innerHeight / canvasH * 100) / 100);
		const canvas = $('#dynamic-canvas');
		const recordingDiv = $('#recording');
		recordingDiv.offset({'left': (canvas.offset().left + canvas.width())});
		recordingDiv.width((window.innerWidth - canvas.width()) / 2);
		recordingDiv.height(window.innerHeight);
	}

	public updateRecording() {
		$('#recording').html(recording.serialize(false, ";"));
	}

	public drawCircle(dynamicCtx: CanvasRenderingContext2D, x: number, y: number, r: number) {
		dynamicCtx.beginPath();
		dynamicCtx.arc(x,y,r,0,Math.PI*2);
		dynamicCtx.closePath();
		dynamicCtx.fill();
	}

	public drawBoard(dynamicCtx: CanvasRenderingContext2D) {
		const r = gameState.board.tokens[0][0].width/2.4;

		dynamicCtx.fillStyle = "white";

		for(let i = 0; i < gameState.board.nbCols; i++) {
			for(let j = 0; j < gameState.board.nbRows; j++) {
				const token = gameState.board.tokens[i][j];
				this.drawCircle(dynamicCtx, token.x+token.width/2, token.y+token.height/2, r);
			}
		}

		dynamicCtx.globalCompositeOperation = "source-atop";

		gameState.board.draw(dynamicCtx);

		dynamicCtx.globalCompositeOperation = "destination-over";

		dynamicCtx.fillStyle = "#1f80cd";
		dynamicCtx.fillRect(0,0,canvasW,canvasH);

		dynamicCtx.globalCompositeOperation = "source-over";
	}

	/** Draws a rectangle with a border radius */
	public strokeRoundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, ratio: number): void {
		this.makeRoundRectPath(context, x, y, width, height, ratio);
		context.stroke();
	}

	/** Draws a rectangle with a border radius */
	public fillRoundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, ratio: number): void {
		this.makeRoundRectPath(context, x, y, width, height, ratio);
		context.fill();
	}

	private makeRoundRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, ratio: number): void {
		if (width < 2 * ratio) {
			ratio = width / 2;
		}
		if (height < 2 * ratio) {
			ratio = height / 2;
		}
		context.beginPath();
		context.moveTo(x + ratio, y);
		context.arcTo(x + width, y, x + width, y + height, ratio);
		context.arcTo(x + width, y + height, x, y + height, ratio);
		context.arcTo(x, y + height, x, y, ratio);
		context.arcTo(x, y, x + width, y, ratio);
		context.closePath();
	}
}

window.requestAnimationFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window["mozRequestAnimationFrame"] ||
		window["oRequestAnimationFrame"] ||
		window["msRequestAnimationFrame"] ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();