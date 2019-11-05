export enum PlayerType {
	HUMAN = "Human",
	AI = "Ai"
}

export class Player {
	private _type: PlayerType;
	public get type(): PlayerType { return this._type; }

	private _id: number;
	public get id(): number { return this._id; }

	private _aiService: string;
	public get aiService(): string { return "http://" + this._aiService; }
	public set aiService(aiService: string) { this._aiService = aiService; }

	private _nbPenalties: number;
	public get nbPenalties(): number { return this._nbPenalties; }
	public set nbPenalties(nbPenalties: number) { this._nbPenalties = nbPenalties; }
	public addPenalty() { this._nbPenalties++; }

	constructor(type: PlayerType, id: number, aiService?: string) {
		this._type = type;
		this._id = id;
		this._aiService = aiService;
		this._nbPenalties = 0;
	}
	
}