/** Defines an object which can be drawn on the canvas */
export interface IDrawable {
	draw(ctx: CanvasRenderingContext2D): void;
}

export interface IUpdatableDrawable extends IDrawable {
	requiresupdate: boolean;
}