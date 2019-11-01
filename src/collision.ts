import { Rectangle } from "./rectangle";
import { renderer } from "./main";

export class Collision {

	public static isCollisionRectlangle(rect1: Rectangle, rect2: Rectangle) {
		return Collision.isCollision(rect1.position.x, rect1.position.y, rect1.bottomRight.x, rect1.bottomRight.y,
			rect2.position.x, rect2.position.y, rect2.bottomRight.x, rect2.bottomRight.y);
	}

	public static isCollisionMouseRectlangle(x: number, y: number, rect: Rectangle) {
		return Collision.isCollision(x, y, x, y,
			rect.position.x * renderer.zoomScale, rect.position.y * renderer.zoomScale, rect.bottomRight.x * renderer.zoomScale, rect.bottomRight.y * renderer.zoomScale);
	}

	public static isCollision(collisionerX1: number, collisionerY1: number, collisionerX2: number, collisionerY2: number,
		collisioneeX1: number, collisioneeY1: number, collisioneeX2: number, collisioneeY2: number): boolean {
		return collisionerX1 < collisioneeX2 && collisionerX2 > collisioneeX1 &&
			collisionerY1 < collisioneeY2 && collisionerY2 > collisioneeY1;
	}

}