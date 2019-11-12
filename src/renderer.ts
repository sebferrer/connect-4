import $ from "jquery";
import { canvasH, canvasW, mainLayers, gameState, recording, editAIServices } from "./main";
import { PlayerType } from "./player";

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
		let zoomScale = window.innerWidth > window.innerHeight ?
			Math.round(window.innerHeight / canvasH * 100) / 100 :
			Math.round(window.innerWidth / canvasW * 100) / 100;

		this.scale(zoomScale);

		this.scaleButtons();
		if(!editAIServices) {
			$('#ai-services').hide();
		}


		const menu = $("#menu");
		const game = $("#game");
		menu.show();
		game.hide();
	}

	public scaleButtons() {
		const canvas = $('#dynamic-canvas');
		const recordingDiv = $('#recording');
		const restartButton = $('#restart');
		const restartText = $('#restart-text');
		const backMenu = $('#back-menu');
		const backMenuText = $('#back-menu-text');

		const menuItems = $(".menu-item");
		const nbItems = menuItems.length;
		menuItems.each(function(index) {
			const item = $(this);
			item.width(window.innerWidth);
			item.height(window.innerHeight / nbItems);
			item.offset({'top': index * item.height() });
			const itemText = item.find('.menu-item-text:first');
			if(window.innerWidth > window.innerHeight) {
				itemText.css('font-size', item.height() / 3);
				itemText.offset({'top': item.offset().top + item.height() / 3 });
			}
			else {
				itemText.css('font-size', item.width() / 10);
				itemText.offset({'top': item.offset().top + item.height() / 2.5 });
			}
		  });
		
		if(window.innerWidth > window.innerHeight) {
			recordingDiv.offset({'left': (canvas.offset().left + canvas.width() )});
			recordingDiv.width((window.innerWidth - canvas.width()) / 2);
			recordingDiv.height(window.innerHeight);

			restartButton.width((window.innerWidth - canvas.width()) / 2);
			restartButton.height(window.innerHeight / 2);
			restartText.css('font-size', restartButton.width() / 7.5);

			backMenu.width((window.innerWidth - canvas.width()) / 2);
			backMenu.offset({'top': window.innerHeight / 2 });
			backMenu.height(window.innerHeight / 2);
			backMenuText.css('font-size', backMenu.width() / 7.5);
		}
		else {
			canvas.offset({'top': window.innerHeight / 2 - canvas.height() / 2 });
			
			recordingDiv.width(window.innerWidth);
			recordingDiv.height(window.innerHeight / 2 - canvas.height() / 2);
			
			restartButton.width(window.innerWidth / 2);
			restartButton.offset({'top': window.innerHeight / 2 + canvas.height() / 2 });
			restartButton.height(window.innerHeight / 2 - canvas.height() / 2 );
			restartText.css('font-size', restartButton.height() / 4);

			backMenu.width(window.innerWidth / 2);
			backMenu.offset({'left': window.innerWidth / 2 });
			backMenu.offset({'top': window.innerHeight / 2 + canvas.height() / 2 });
			backMenu.height(window.innerHeight / 2 - canvas.height() / 2 );
			backMenuText.css('font-size', restartButton.height() / 4);

			//const aiServices = $('#ai-services-container');
			//aiServices.hide();
		}
		restartText.offset({'top': restartButton.offset().top + restartButton.height() / 2 });
		backMenuText.offset({'top': backMenu.offset().top + backMenu.height() / 2 });
	}

	public scaleAIServices() {
		const aiServicesContainer = $('#ai-services-container');
		
		if(!editAIServices) {
			aiServicesContainer.hide();
			return;
		}

		const canvas = $('#dynamic-canvas');
		const aiServices = $('#ai-services');
		const setAi = $('#set-ai');
		const setAiText = $('#set-ai-text');
		const setAiStart = $('#set-ai-start');
		const setAiStartText = $('#set-ai-start-text');

		if(gameState != null) {
			if(gameState.getPlayer(1).type !== PlayerType.AI) {
				$("#ai1").hide();
			}
			if(gameState.getPlayer(2).type !== PlayerType.AI) {
				$("#ai2").hide();
			}
			if(gameState.getPlayer(1).type !== PlayerType.AI && gameState.getPlayer(2).type !== PlayerType.AI) {
				aiServicesContainer.hide();
				return;
			}

			aiServices.offset({'top': 20 });
			aiServices.width((window.innerWidth - canvas.width()) / 2);
			aiServices.css('font-size', aiServices.width() / 10);
			aiServices.children(".ai-service").each(function(i) {
				const item = $(this);
				const itemText = item.find('.ai-service-text');
				itemText.width(aiServices.width() - aiServices.width() / 20);
				itemText.css('font-size', itemText.width() / 10);
			});

			setAi.offset({'top': aiServices.offset().top + aiServices.height() + 20});
			setAi.width(aiServices.width());
			setAi.height((window.innerHeight - aiServices.offset().top - aiServices.height()) / 2);
			setAiText.css('font-size', setAi.width() / 4);
			setAiText.offset({'top': setAi.offset().top + setAi.height() / 2 - setAi.width() / 4 });

			if(gameState.getPlayer(1).type !== PlayerType.AI) {
				setAiStart.hide();
				return;
			}

			setAiStart.offset({'top': setAi.offset().top + setAi.height()});
			setAiStart.width(aiServices.width());
			setAiStart.height(window.innerHeight - setAiStart.offset().top - setAiStart.height());
			setAiStartText.css('font-size', setAiStart.width() / 4);
			setAiStartText.offset({'top': setAiStart.offset().top + setAiStart.height() / 2 - setAiStart.width() / 4 });
		}
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

	public showRestarButton() {
		$('#restart').show();
	}

	public hideRestarButton() {
		$('#restart').hide();
	}

	public showBackMenuButton() {
		$('#back-menu').show();
	}

	public hideBackMenuButton() {
		$('#back-menu').hide();
	}

	public showMenu() {
		$("#menu").show();
	}

	public hideMenu() {
		$("#menu").hide();
	}

	public showGame() {
		$("#game").show();
	}

	public hideGame() {
		$("#game").hide();
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