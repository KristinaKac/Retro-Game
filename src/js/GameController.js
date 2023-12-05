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

    this.moveRangeAttack = {
      Bowman: { move: 2, attackRange: 2 },
      Swordsman: { move: 4, attackRange: 1 },
      Magician: { move: 1, attackRange: 4 },
      Vampire: { move: 2, attackRange: 2 },
      Undead: { move: 4, attackRange: 1 },
      Daemon: { move: 1, attackRange: 4 }
    };


    this.arrPlayers = [];
    this.arrCompetitors = [];

    this.initPlayersPositions = [];
    this.initCompetitorsPositions = [];

    this.previousIndex = -1;
  }

  initPositions(column1, column2, resultArr) {
    for (let i = 0; i < ((this.gamePlay.boardSize * this.gamePlay.boardSize) - 1); i++) {
      if (i % this.gamePlay.boardSize === column1 || i % this.gamePlay.boardSize === column2) {
        resultArr.push(i);
      }
    }
  }

  randomInitPositions(team, initPositions, teamPositions) {
    let positions = new Set();
  
    while(positions.size < team.characters.length){
      positions.add(initPositions[Math.floor(Math.random() * initPositions.length)]);
    }
    let arr = Array.from(positions);
    for (let i = 0; i < team.characters.length; i++) {
      teamPositions.push(new PositionedCharacter(team.characters[i], arr[i]));
    }
  }

  init() {
    this.gamePlay.drawUi('prairie');

    const teamPlayers = generateTeam(this.playerTypes, 4, 4);
    const teamCompetitors = generateTeam(this.competitorTypes, 4, 4);

    this.initPositions(0, 1, this.initPlayersPositions);

    this.initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2), this.initCompetitorsPositions);

    this.randomInitPositions(teamPlayers, this.initPlayersPositions, this.arrPlayers);
    this.randomInitPositions(teamCompetitors, this.initCompetitorsPositions, this.arrCompetitors);

    this.gamePlay.redrawPositions([...this.arrPlayers, ...this.arrCompetitors]);

    this.someMethodName();

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  someMethodName() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }


  onCellClick(index) {
    if (this.previousIndex != -1) {
      this.gamePlay.deselectCell(this.previousIndex);
    }

    if (this.gamePlay.cells[index].children[0]) {
      // console.log(this.arrPlayers)
      let result = this.arrPlayers.find(el =>
        this.gamePlay.cells[index].children[0].className.includes(el.character.type) &&
        el.position === index
      )
      if (!result) {
        return GamePlay.showError('Ошибка');
      }
      this.previousIndex = index;
      this.gamePlay.selectCell(index);

      // console.log(index)
      this.moveCharacter(result)
    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.showCellTooltip(this.getInfoCharacter(index), index);
      this.gamePlay.setCursor('pointer');
    }

  }

  moveCharacter(character) {
    console.log(character)


  }

  getInfoCharacter(index) {
    const commonArr = [...this.arrPlayers, ...this.arrCompetitors];
    const positionedCharacter = commonArr.find(el => el.position === index);
    const charact = positionedCharacter.character;
    const message = `\u{1F396}${charact.level} \u{2694}${charact.attack} \u{1F6E1}${charact.defence} \u{2764}${charact.health}`;
    return message;

  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
  }
}
