import { GameState } from "./gameState";
import { ImageBank } from "./imageBank";
import { Renderer } from "./renderer";
import { EventManager } from "./eventManager";
import { Recording } from "./recording";
import { Contest } from "./contest";

export let gameState: GameState;
export let recording: Recording;
export const contest = new Contest();

export const record = true;
export const recordGeneration = false;
export const editAIServices = false;
export const coporate = false;

export const canvasW = 660;
export const canvasH = 480;

export const dynamicCanvas = document.getElementById("dynamic-canvas") as HTMLCanvasElement;
export const dynamicCtx = dynamicCanvas.getContext("2d", { alpha: true });

export const mainLayers: Array<{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }> = [
	{ canvas: dynamicCanvas, ctx: dynamicCtx }
];

export const IMAGE_BANK = new ImageBank();
export const renderer = new Renderer();
export let eventManager: EventManager;

window.onload = () => {
	IMAGE_BANK.loadImages().then(() => {
		renderer.autoScale();
		eventManager = new EventManager();
		gameState = new GameState();
		recording = new Recording();
		gameState.update();
	});
};