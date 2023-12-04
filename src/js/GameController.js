import { generateTeam } from './generators'
import { Bowman } from './characters/Bowman';
import { Swordsman } from './characters/Swordsman';
import { Magician } from './characters/Magician';
import { Daemon } from './characters/Daemon';
import { Undead } from './characters/Undead';
import { Vampire } from './characters/Vampire';

import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.playerTypes = [Bowman, Swordsman, Magician];
    this.competitorTypes = [Vampire, Undead, Daemon];

  }

  init() {
    this.gamePlay.drawUi('prairie');

    const players = generateTeam(this.playerTypes, 4, 4);
    const competitors = generateTeam(this.competitorTypes, 4, 4);

    const arrPlayers = [];
    const arrCompetitors = [];

    let arrPlayersPositions = [];
    let arrCompetitorsPositions = [];


    for (let i = 0; i < ((this.gamePlay.boardSize * this.gamePlay.boardSize) - 1); i++) {
      if (i % this.gamePlay.boardSize === 0 || i % this.gamePlay.boardSize === 1) {
        arrPlayersPositions.push(i);
      }
    }

    for (let i = 0; i < ((this.gamePlay.boardSize * this.gamePlay.boardSize) - 1); i++) {
      if (i % this.gamePlay.boardSize === (this.gamePlay.boardSize - 1) || i % this.gamePlay.boardSize === (this.gamePlay.boardSize - 2)) {
        arrCompetitorsPositions.push(i);
      }
    }

    players.characters.forEach(character => {
      const position = arrPlayersPositions[Math.floor(Math.random() * arrPlayersPositions.length)];
      arrPlayersPositions = arrPlayersPositions.filter(element => !(element === position))
      arrPlayers.push(new PositionedCharacter(character, position));
    });

    competitors.characters.forEach(character => {
      const position = arrCompetitorsPositions[Math.floor(Math.random() * arrCompetitorsPositions.length)];
      arrCompetitorsPositions = arrCompetitorsPositions.filter(element => !(element === position))
      arrCompetitors.push(new PositionedCharacter(character, position));
    });

    this.gamePlay.redrawPositions([...arrPlayers, ...arrCompetitors]);

    this.someMethodName();

    // if (this.gamePlay.cells[1].children[0]) {
    //   console.log('yes')
    // }

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  someMethodName() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
  }


  onCellClick(index) {
    
    
    // TODO: react to click
  }

  onCellEnter(index) {
    if (this.cells[index].children[0]) {
      this.showCellTooltip('hello', index)
      }

    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
