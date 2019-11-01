import { Rectangle } from "./rectangle";

export class Token {

	public value: number;
	public rect: Rectangle;

	public get x(): number { return this.rect.position.x; }
	public get y(): number { return this.rect.position.y; }
	public get width(): number { return this.rect.width; }
	public get height(): number { return this.rect.height; }

	constructor(rect: Rectangle, value?: number) {
		this.value = value == null ? 0 : value;
		this.rect = rect;
	}

}