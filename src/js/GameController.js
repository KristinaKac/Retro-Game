import { generateTeam } from './generators'
import { Bowman } from './characters/Bowman';
import { Swordsman } from './characters/Swordsman';
import { Magician } from './characters/Magician';
import { Daemon } from './characters/Daemon';
import { Undead } from './characters/Undead';
import { Vampire } from './characters/Vampire';

import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.playerTypes = [Bowman, Swordsman, Magician];
    this.competitorTypes = [Vampire, Undead, Daemon];

    this.moveRangeAttack = [
      { name: 'bowman', move: 2, attackRange: 2 },
      { name: 'swordsman', move: 4, attackRange: 1 },
      { name: 'magician', move: 1, attackRange: 4 },
      { name: 'vampire', move: 2, attackRange: 2 },
      { name: 'undead', move: 4, attackRange: 1 },
      { name: 'daemon', move: 1, attackRange: 4 }
    ];


    this.arrPlayers = [];
    this.arrCompetitors = [];

    this.initPlayersPositions = [];
    this.initCompetitorsPositions = [];

    this.previousIndex = -1;
    this.ourPlayer;
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

    while (positions.size < team.characters.length) {
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
      GameState.characterSelected = false;
    }
    this.ourPlayer = this.playerOrCompetitor(index);

    if (this.ourPlayer) {
      this.previousIndex = index;
      this.gamePlay.selectCell(index, 'yellow');

      GameState.characterSelected = true;
    }

  }

  playerOrCompetitor(index) {
    if (this.gamePlay.cells[index].children[0]) {
      let result = this.arrPlayers.find(el =>
      (this.gamePlay.cells[index].children[0].className.includes(el.character.type) &&
        el.position === index)
      )
      if (result) {
        return result;
      } return GamePlay.showError('Ошибка');

    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.showCellTooltip(this.getInfoCharacter(index), index);
      this.gamePlay.setCursor('pointer');
    }
    if (GameState.characterSelected === true) {
      const leftRightMove = this.horizontalMovementAccess(this.ourPlayer);
      const upDownMove = this.verticalMovementAccess(this.ourPlayer);
      const diagonalMove = this.diagonalLeftRightMovementAccess(this.ourPlayer);
      const diagonalMove1 = this.diagonalRightLeftMovementAccess(this.ourPlayer);


      const accessCell = leftRightMove.forEach(el => {
        if (el === index) {
          if (this.gamePlay.cells[index].children[0]) {
            this.gamePlay.setCursor('pointer');
          } else {
            this.gamePlay.selectCell(index, 'green');
            this.gamePlay.setCursor('pointer');
          }

        }
      });

      const accessCellv = upDownMove.forEach(el => {
        if (el === index) {
          if (this.gamePlay.cells[index].children[0]) {
            this.gamePlay.setCursor('pointer');
          } else {
            this.gamePlay.selectCell(index, 'green');
            this.gamePlay.setCursor('pointer');
          }
        }
      });
      const accessCelld = diagonalMove.forEach(el => {
        if (el === index) {
          if (this.gamePlay.cells[index].children[0]) {
            this.gamePlay.setCursor('pointer');
          } else {
            this.gamePlay.selectCell(index, 'green');
            this.gamePlay.setCursor('pointer');
          }

        }
      });
    }

  }

  getMoveAttackCharacter(character) {
    const result = this.moveRangeAttack.find(el => el.name === character.character.type);
    return result;
  }




  diagonalRightLeftMovementAccess(character){
    const moveAttackCharacter = this.getMoveAttackCharacter(character);


    let array = [];

    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      let arr = [];
      
      let r = i * this.gamePlay.boardSize;
      console.log(r)
      for (let j = 0; j <= r; j = j + this.gamePlay.boardSize - 1) {
        

        arr.push(i + j)
      }
      
      let element = arr.forEach(el => {
        if (el === character.position) {
          array = arr;
        }
      });
    }
    console.log(array)
  }









  diagonalLeftRightMovementAccess(character) {
    const amountDiagonal = ((this.gamePlay.boardSize * 2) - 1);

    const moveAttackCharacter = this.getMoveAttackCharacter(character);

    let array = [];

    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      let arr = [];
      let r = (this.gamePlay.boardSize * this.gamePlay.boardSize - 1) - (i * this.gamePlay.boardSize);
      for (let j = 0; j <= r; j = j + this.gamePlay.boardSize + 1) {
        arr.push(i + j)
      }
      let element = arr.forEach(el => {
        if (el === character.position) {
          array = arr;
        }
      });
    }
    // console.log(array)

    for (let i = 0; i < this.gamePlay.boardSize * this.gamePlay.boardSize - this.gamePlay.boardSize; i = i + this.gamePlay.boardSize) {
      let arr = [];
      let r = ((this.gamePlay.boardSize * this.gamePlay.boardSize - 1) - i);

      for (let j = 0; j <= r; j = j + this.gamePlay.boardSize + 1) {

        arr.push(i + j)
      }
      let element = arr.forEach(el => {
        if (el === character.position) {
          array = arr;
        }
      });
    }
    // console.log(array)


    let index = array.findIndex(el => el === character.position);

    let upLeftMove;
    let downRightMove;

    ((index - moveAttackCharacter.move) >= 0) ?
      upLeftMove = moveAttackCharacter.move : upLeftMove = index;

    ((index + moveAttackCharacter.move) <= (array.length - 1)) ?
    downRightMove = moveAttackCharacter.move : downRightMove = (array.length - 1) - index;

    const arr7 = [];

    for (let i = (index - upLeftMove); i < index; i++) {
      arr7.push(array[i])
    }
    for (let i = index + 1; i > index && i <= (index + downRightMove); i++) {
      arr7.push(array[i])
    }
return arr7
  }


  verticalMovementAccess(character) {
    const moveAttackCharacter = this.getMoveAttackCharacter(character);

    const upDownMove = [];

    const column = character.position % this.gamePlay.boardSize;

    for (let i = 0; i < (this.gamePlay.boardSize * this.gamePlay.boardSize - 1); i++) {
      if (i % this.gamePlay.boardSize === column) {
        upDownMove.push(i);
      }
    }
    let index = upDownMove.findIndex(el => el === character.position);

    let upMove;
    let downMove;

    ((index - moveAttackCharacter.move) >= 0) ?
      upMove = moveAttackCharacter.move : upMove = index;

    ((index + moveAttackCharacter.move) <= (upDownMove.length - 1)) ?
      downMove = moveAttackCharacter.move : downMove = (upDownMove.length - 1) - index;

    const arr = [];

    for (let i = (index - upMove); i < index; i++) {
      arr.push(upDownMove[i])
    }
    for (let i = index + 1; i > index && i <= (index + downMove); i++) {
      arr.push(upDownMove[i])
    }
    return arr;
  }
  horizontalMovementAccess(character) {
    const moveAttackCharacter = this.getMoveAttackCharacter(character);
    let minInterval = 0;
    let maxInterval = this.gamePlay.boardSize - 1;

    while (true) {
      if (character.position <= maxInterval && character.position >= minInterval) {
        break;
      }
      minInterval = minInterval + this.gamePlay.boardSize;
      maxInterval = maxInterval + this.gamePlay.boardSize;
    }
    const leftRightMove = [];
    let leftMove;
    let rightMove;

    ((character.position - minInterval) >= moveAttackCharacter.move) ?
      leftMove = moveAttackCharacter.move : leftMove = character.position - minInterval;

    ((maxInterval - character.position) >= moveAttackCharacter.move) ?
      rightMove = moveAttackCharacter.move : rightMove = maxInterval - character.position;

    for (let i = 1; i <= leftMove; i++) {
      leftRightMove.push(character.position - i);
    }
    for (let i = 1; i <= rightMove; i++) {
      leftRightMove.push(character.position + i);
    }
    // console.log(leftRightMove)
    return leftRightMove;
  }


  getInfoCharacter(index) {
    const commonArr = [...this.arrPlayers, ...this.arrCompetitors];
    const positionedCharacter = commonArr.find(el => el.position === index);
    const charact = positionedCharacter.character;
    const message = `\u{1F396}${charact.level} \u{2694}${charact.attack} \u{1F6E1}${charact.defence} \u{2764}${charact.health}`;
    return message;

  }

  onCellLeave(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
    } else {
      this.gamePlay.deselectCell(index);
    }

  }
}
