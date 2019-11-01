import { IPositionable } from "./iposisionable";
import { Point } from "./point";

export class Rectangle implements IPositionable {

	public get width(): number { return this.bottomRight.x - this.topLeft.x; }
	public get height(): number { return this.bottomRight.y - this.topLeft.y; }
	public get position(): Point { return this.topLeft; }

	public topLeft: Point;
	public bottomRight: Point;

	constructor(topLeft: Point, bottomRight: Point) {
		this.topLeft = Point.copy(topLeft);
		this.bottomRight = Point.copy(bottomRight);
	}
}