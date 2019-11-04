export enum GameMode {
	HUMAN_HUMAN = "Human_human",
    HUMAN_AI = "Human_AI",
    AI_HUMAN = "AI_human",
    AI_AI = "AI_AI",
}

export class GameModeUtil {

    public static getGameMode(code: string) {
        switch(code) {
            case "hh": return GameMode.HUMAN_HUMAN; break;
            case "hai": return GameMode.HUMAN_AI; break;
            case "aih": return GameMode.AI_HUMAN; break;
            case "aiai": return GameMode.AI_AI; break;
            default: return null; break;
        }
    }

}