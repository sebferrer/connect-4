import { IMAGE_BANK, canvasH, canvasW } from "./main";
import { Token } from "./token";
import { Point } from "./point";
import { Rectangle } from "./rectangle";
import { IDrawable } from "./idrawable";
import { Player } from "./player";
import { ArrayUtil } from "./util";

export const TOKEN_IMG = new Map<number, string>([
	[0, "assets/img/grey.png"],
	[1, "assets/img/yellow.png"],
	[2, "assets/img/red.png"],
	[3, "assets/img/yellow2.png"],
	[4, "assets/img/red2.png"]
]);

export class Board implements IDrawable {

	public nbRows: number;
	public nbCols: number;
	public tokens: Array<Array<Token>>;
	public victoryTokens: Array<Token>;
	public space: number;
	public tokenSize: number;

	constructor(nbRows: number, nbCols: number) {
		this.nbRows = nbRows;
		this.nbCols = nbCols;
		this.tokens = new Array<Array<Token>>();
		this.victoryTokens = new Array<Token>();
		this.space = 1;
		this.tokenSize = canvasW > canvasH ? canvasH/(this.nbCols) * 1.1 : canvasW/(this.nbRows) * 1.1;
		const remainW = canvasW - this.tokenSize * this.space * nbCols;
		for(let i = 0; i < this.nbCols; i++) {
			this.tokens[i] = new Array<Token>();
			for(let j = 0; j < this.nbRows; j++) {
				this.tokens[i][j] = new Token(
					new Rectangle(
						new Point(remainW/2 + i * this.tokenSize * this.space, canvasH/50 + j * this.tokenSize * this.space),
						new Point(remainW/2 + i * this.tokenSize * this.space + this.tokenSize, canvasH/50 + j * this.tokenSize * this.space + this.tokenSize)
					)
				);
			}
		}
	}

	public static copy(board: Board): Board {
		const newBoard = new Board(board.nbRows, board.nbCols);
		for(let i = 0; i < board.nbCols; i++) {
			newBoard.tokens[i] = new Array<Token>();
			for(let j = 0; j < board.nbRows; j++) {
				newBoard.tokens[i][j] = new Token(
						new Rectangle(board.tokens[i][j].rect.topLeft, board.tokens[i][j].rect.bottomRight),
						board.tokens[i][j].value
					);
			}
		}
		return newBoard;
	}

	public get2Dboard(pivot?: boolean): Array<Array<number>> {
		pivot = pivot == null ? false : pivot;
		const boardTmp = new Array<Array<number>>();
		const board = new Array<Array<number>>();

		for(let i = 0; i < this.nbCols; i++) {
			boardTmp[i] = new Array<number>();
			board[i] = new Array<number>();
			for(let j = 0; j < this.nbRows; j++) {
				if(pivot) {
					// boardTmp[i][j] = this.tokens[i][j].value;
					boardTmp[i][j] = this.tokens[i][j].value !== 3 && this.tokens[i][j].value !== 4 ? this.tokens[i][j].value : 0;
				}
				else {
					// board[i][j] = this.tokens[i][j].value;
					board[i][j] = this.tokens[i][j].value !== 3 && this.tokens[i][j].value !== 4 ? this.tokens[i][j].value : 0;
				}
			}
		}

		if(pivot) {
			for(let i = 0; i < this.nbCols; i++) {
				for(let j = 0; j < this.nbRows; j++) {
					board[j][i] = boardTmp[i][j];
				}
			}
			board.pop();
		}

		return board;
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		for(let i = 0; i < this.nbCols; i++) {
			for(let j = 0; j < this.nbRows; j++) {
				const token = this.tokens[i][j];
				ctx.drawImage(IMAGE_BANK.pictures[TOKEN_IMG.get(this.tokens[i][j].value)],
					0, 0, 100, 100,
					token.x, token.y, token.width, token.height);
			}
		}
	}

	public drawVictory(ctx: CanvasRenderingContext2D): void {
		for(let i = 0; i < this.victoryTokens.length; i++) {
			ctx.beginPath();
			ctx.arc(
				this.victoryTokens[i].x + this.victoryTokens[i].width/2,
				this.victoryTokens[i].y + this.victoryTokens[i].height/2,
				this.victoryTokens[i].width/4, 0, 2 * Math.PI, false);
			ctx.lineWidth = 5;
			ctx.strokeStyle = "yellow";
			ctx.stroke();
		}
	}

	public drawLastMove(lastMove: Token, ctx: CanvasRenderingContext2D): void {
		if(lastMove == null) {
			return;
		}
		ctx.beginPath();
		ctx.arc(
			lastMove.x + lastMove.width/2,
			lastMove.y + lastMove.height/2,
			lastMove.width/2, 0, 2 * Math.PI, false);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#FFDC75";
		ctx.stroke();
	}
	
	public nextRow(line: number): number {
		for(let i = this.tokens[line].length - 1; i >= 0; i--) {
			if([0, 3, 4].includes(this.tokens[line][i].value)) {
				return i;
			}
		}
		return -1;
	}

	public getNbTokens(): number {
		let c = 0;
		for(let i = this.nbCols - 1; i >= 0; i--) {
			for(let j = this.nbRows - 1; j >= 0; j--) {
				if([0, 3, 4].includes(this.tokens[i][j].value)) {
					break;
				}
				else {
					c++;
				}
			}
		}
		return c;
	}

	public isDraw(): boolean {
		return this.getNbTokens() === this.nbCols * this.nbRows;
	}

	public check(p: Player): boolean {
		const player = p.id;
		let win = false;
		// horizontalCheck 
		for(let j = 0; j < this.nbRows-3 ; j++ ) {
			for(let i = 0; i < this.nbCols; i++) {
				if(this.tokens[i][j].value === player && this.tokens[i][j+1].value === player &&
					this.tokens[i][j+2].value === player && this.tokens[i][j+3].value === player) {
					win = true;
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j+1]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j+2]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j+3]);
				}		   
			}
		}
		// verticalCheck
		for(let i = 0; i < this.nbCols-3 ; i++) {
			for(let j = 0; j < this.nbRows; j++) {
				if(this.tokens[i][j].value === player && this.tokens[i+1][j].value === player &&
					this.tokens[i+2][j].value === player && this.tokens[i+3][j].value === player) {
					win = true;
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i+1][j]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i+2][j]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i+3][j]);
				}		   
			}
		}
		// ascendingDiagonalCheck 
		for(let i = 3; i < this.nbCols; i++) {
			for(let j = 0; j < this.nbRows-3; j++) {
				if(this.tokens[i][j].value === player && this.tokens[i-1][j+1].value === player &&
					this.tokens[i-2][j+2].value === player && this.tokens[i-3][j+3].value === player) {
					win = true;
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-1][j+1]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-2][j+2]);
					ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-3][j+3]);
				}
			}
		}
		// descendingDiagonalCheck
		for(let i = 3; i < this.nbCols; i++) {
			for(let j = 3; j < this.nbRows; j++) {
				if(this.tokens[i][j].value === player && this.tokens[i-1][j-1].value === player &&
					this.tokens[i-2][j-2].value === player && this.tokens[i-3][j-3].value === player) {
						win = true;
						ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i][j]);
						ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-1][j-1]);
						ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-2][j-2]);
						ArrayUtil.addNoDuplicate(this.victoryTokens, this.tokens[i-3][j-3]);
					}
			}
		}
		return win;
	}

}