export class Participant {

    public id: string;
    public service: string;
    public nbWin: number;
    public nbLose: number;
    public nbDraw: number;
    public nbPoints: number;
    public nbPenalties: number;

    public get finalScore() { return this.nbPoints - this.nbPenalties; }

    constructor(id: string, service: string) {
        this.id = id;
        this.service = service;
        this.nbPoints = 0;
        this.nbPenalties = 0;
        this.nbWin = 0;
        this.nbLose = 0;
        this.nbDraw = 0;
    }

    public addPoints(nbPoints) {
        this.nbPoints += nbPoints;
    }

    public addPenalties(nbPenalties) {
        this.nbPenalties += nbPenalties;
    }

    
}