import { Participant } from "./participant";
import { Player, PlayerType } from "./player";

export const PARTICIPANTS: Participant[] = [
    new Participant("seb", "164.132.97.208:5001/mlp/predict"),
    new Participant("titi", "164.132.97.208:5001/mlp/predict"),
    new Participant("patpat", "164.132.97.208:5001/mlp/predict"),
    new Participant("romain", "164.132.97.208:5001/mlp/predict"),
    new Participant("aracely", "164.132.97.208:5001/mlp/predict"),
    new Participant("evgenios", "164.132.97.208:5001/mlp/predict")
];

export class Contest {

    public _player1Index: number;
    public get player1Index(): number { return this._player1Index; }
    public set player1Index(player1Index: number) { this._player1Index = player1Index; }
    
    public _player2Index: number;
    public get player2Index(): number { return this._player2Index; }
    public set player2Index(player2Index: number) { this._player2Index = player2Index; }

    public finished: boolean;

    constructor() {
        this._player1Index = 0;
        this._player2Index = 1;
        this.finished = false;
    }

    public setNextRound(): void {
        if(this.player1Index === this.player2Index && this.player1Index === PARTICIPANTS.length) {
            this.finished = true;
            return;
        }

        if(this.player2Index + 1 < PARTICIPANTS.length) {
            this.player2Index++;
            if(this.player2Index === this.player1Index) {
                if(this.player1Index + 1 === PARTICIPANTS.length) {
                    this.finished = true;
                }
                else {
                    this.player2Index++;
                }
            }
        }
        else {
            this.player2Index = 0;
            if(this.player1Index + 1 < PARTICIPANTS.length) {
                this.player1Index++;
            }
            else {
                this.finished = true;
            }
        }
    }

    public getParticipantByCSL(csl: string): Participant {
        for(let i = 0; i < PARTICIPANTS.length; i++) {
            if(PARTICIPANTS[i].csl === csl) {
                return PARTICIPANTS[i];
            }
        }
        return null;
    }

    public getPlayers(index1: number = this.player1Index, index2: number = this.player2Index): Array<Player> {
        return [
            new Player(PlayerType.AI, 1, PARTICIPANTS[index1].service, PARTICIPANTS[index1].csl),
            new Player(PlayerType.AI, 2, PARTICIPANTS[index2].service, PARTICIPANTS[index2].csl)
        ];
    }

}