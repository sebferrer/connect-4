export enum PlayerType {
	HUMAN = "Human",
	AI = "Ai"
}

export class Player {
	private _type: PlayerType;
	public get type() { return this._type; }

	private _id: number;
	public get id() { return this._id; }

	private _aiService: string;
	public get aiService() { return "http://" + this._aiService; }

	constructor(type: PlayerType, id: number, aiService?: string) {
		this._type = type;
		this._id = id;
		this._aiService = aiService;
	}
	
}