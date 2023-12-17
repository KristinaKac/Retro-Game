import GameController from "../GameController";
import GamePlay from "../GamePlay";
import GameStateService from "../GameStateService";
import { Magician } from "../characters/Magician";
import PositionedCharacter from "../PositionedCharacter";
import GameState from "../GameState";


test.each([
    [0, 3, 8, 9],
    [7, 2, 8, 6],
    [63, 4, 8, 12],
    [45, 1, 8, 8],
])('number of possible moves received: position %i, move %i, boardSize %s', (position, move, boardSize, expected) => {
    const gameController = new GameController(new GamePlay(), new GameStateService());
    const result = gameController.getAllMoves(position, move, boardSize);
    const set = new Set(result);
    expect(set.size).toBe(expected);
});

