import { Point } from "./point";

export interface IPositionable {
	width: number;
	height: number;
	/** Top left */
	position: Point;
}