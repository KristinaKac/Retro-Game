import { generateTeam } from './generators'
import { randomInitPositions } from './generators'

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
    this.gameState = new GameState();


    this.initPlayersPositions = [];
    this.initCompetitorsPositions = [];

  }



  initPositions(column1, column2, resultArr) {
    for (let i = 0; i < ((this.gamePlay.boardSize * this.gamePlay.boardSize) - 1); i++) {
      if (i % this.gamePlay.boardSize === column1 || i % this.gamePlay.boardSize === column2) {
        resultArr.push(i);
      }
    }
  }


  init() {

    this.gamePlay.drawUi('prairie');

    const teamPlayers = generateTeam(this.gameState.playerTypes, 4, 4);
    const teamCompetitors = generateTeam(this.gameState.competitorTypes, 4, 4);

    this.initPositions(0, 1, this.initPlayersPositions);
    this.initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2), this.initCompetitorsPositions);


    randomInitPositions(teamPlayers, this.initPlayersPositions, this.gameState.teamPlayers);
    randomInitPositions(teamCompetitors, this.initCompetitorsPositions, this.gameState.teamCompetitors);


    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
    this.someMethodName();
  }

  someMethodName() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  getMoveAttack() {
    if (this.gameState.currentCharacterPosition) {
      this.gameState.attackMove = this.gameState.moveRangeAttack.find(
        el => el.name === this.gameState.currentCharacterPosition.character.type
      );
      return;
    }
    this.gameState.attackMove = null;
  }


  redrawingCharacterMove(index) {

  }
  onCellEnter(index) {
    this.gameState.enterIndex = index;

    if (this.gamePlay.cells[this.gameState.enterIndex].children[0]) {
      this.gamePlay.showCellTooltip(this.getInfoCharacter(this.gameState.enterIndex), this.gameState.enterIndex);
      this.gamePlay.setCursor('pointer');
    }
    

      console.log(this.displayOfAvailableMoves(this.gameState.enterIndex));
    
  }

  onCellClick(index) {
    this.gameState.currentIndex = index;
    this.typeCurrentIndex();

    if (this.gameState.typeCurrentIndex === 'character') {
      if (this.gamePlay.cells[this.gameState.currentIndex].className.includes('selected-yellow')) {
        this.gamePlay.deselectCell(this.gameState.currentIndex);

        this.gameState.currentIndex = null;
        this.gameState.typeCurrentIndex = null;
        this.gameState.currentCharacterPosition = null;
        return;
      }
      if(this.gameState.previousIndex != -1){
        this.gamePlay.deselectCell(this.gameState.previousIndex);
      }
      this.gamePlay.selectCell(index, 'yellow');
    }

    if (this.gameState.typeCurrentIndex === 'empty') {
      this.gamePlay.deselectCell(this.gameState.previousIndex);
    }

    if (this.gameState.typeCurrentIndex === 'competitor') {
      this.gamePlay.deselectCell(this.gameState.previousIndex);
    }

    this.gameState.previousIndex = this.gameState.currentIndex;
    this.gameState.previousType = this.gameState.typeCurrentIndex;
    this.gameState.previousCharacterPosition = this.gameState.currentCharacterPosition;
  }

  typeCurrentIndex() {
    if (!this.gamePlay.cells[this.gameState.currentIndex].children[0]) {
      this.gameState.typeCurrentIndex = 'empty';
      this.gameState.currentCharacterPosition = null;
      return;
    }
    const result = this.gameState.teamPlayers.find(el =>
      this.gamePlay.cells[this.gameState.currentIndex].children[0].className.includes(el.character.type) &&
      el.position === this.gameState.currentIndex
    )

    if (result) {
      this.gameState.typeCurrentIndex = 'character';
      this.gameState.currentCharacterPosition = result;

      return;
    }
    this.gameState.typeCurrentIndex = 'competitor';
    this.gameState.currentCharacterPosition = null;
    return GamePlay.showError('Ошибка');
  }



  displayOfAvailableMoves(index) {
    if (this.gameState.typeCurrentIndex === 'character') {
      const horizontal = this.selectNextMove(this.horizontalMovementAccess(), index);
      const vertical = this.selectNextMove(this.verticalMovementAccess(), index);
      const diagonal1 = this.selectNextMove(this.diagonalRightLeftFirstPart(), index);
      const diagonal2 = this.selectNextMove(this.diagonalRightLeftSecondPart(), index);
      const diagonal3 = this.selectNextMove(this.diagonalLeftRightFirstPart(), index);
      const diagonal4 = this.selectNextMove(this.diagonalLeftRightSecondPart(), index);

      const arr = [horizontal, vertical, diagonal1, diagonal2, diagonal3, diagonal4];

      if (arr.includes(index)) {
        return index;
      }
    }


  }

  selectNextMove(accessMove, index) {
    let move;
    accessMove.forEach(el => {
      if (el === index) {
        this.gamePlay.setCursor('pointer');
        if (!this.gamePlay.cells[index].children[0]) {
          this.gamePlay.selectCell(index, 'green');
          move = index;
        }
      }
    });
    return move;
  }




  diagonalRightLeftFirstPart() {
    let diagonalRightLeftMove = [];
    const board = this.gamePlay.boardSize;

    for (let i = 0; i < board; i++) {
      let arr = [];
      let column = i * board;

      for (let j = 0; j + i <= column; j = j + board - 1) {
        arr.push(i + j)
      }

      arr.forEach(el => {
        if (el === this.gameState.currentCharacterPosition.position) {
          diagonalRightLeftMove = arr;
        }
      });
    }
    return this.getAccessMove(diagonalRightLeftMove);
  }

  diagonalRightLeftSecondPart() {
    let diagonalRightLeftMove = [];
    const board = this.gamePlay.boardSize;

    let column = board * board - board;
    for (let i = board - 1; i <= board * board - 1; i = i + board) {
      let arr = [];
      for (let j = 0; j + i <= column; j = j + board - 1) {
        arr.push(i + j)
      }
      column++;
      arr.forEach(el => {
        if (el === this.gameState.currentCharacterPosition.position) {
          diagonalRightLeftMove = arr;
        }
      });
    }
    return this.getAccessMove(diagonalRightLeftMove);
  }

  diagonalLeftRightFirstPart() {
    let diagonalLeftRightMove = [];
    const board = this.gamePlay.boardSize;

    for (let i = 0; i < board; i++) {
      let arr = [];
      let column = (board * board - 1) - (i * board);
      for (let j = 0; j <= column; j = j + board + 1) {
        arr.push(i + j)
      }
      arr.forEach(el => {
        if (el === this.gameState.currentCharacterPosition.position) {
          diagonalLeftRightMove = arr;
        }
      });
    }
    return this.getAccessMove(diagonalLeftRightMove);
  }

  diagonalLeftRightSecondPart() {
    let diagonalLeftRightMove = [];
    const board = this.gamePlay.boardSize;

    for (let i = 0; i < board * board - board; i = i + board) {
      let arr = [];
      let column = ((board * board - 1) - i);

      for (let j = 0; j <= column; j = j + board + 1) {
        arr.push(i + j)
      }
      arr.forEach(el => {
        if (el === this.gameState.currentCharacterPosition.position) {
          diagonalLeftRightMove = arr;
        }
      });
    }
    return this.getAccessMove(diagonalLeftRightMove);
  }

  verticalMovementAccess() {
    const upDownMove = [];

    const column = this.gameState.currentCharacterPosition.position % this.gamePlay.boardSize;

    for (let i = 0; i < (this.gamePlay.boardSize * this.gamePlay.boardSize - 1); i++) {
      if (i % this.gamePlay.boardSize === column) {
        upDownMove.push(i);
      }
    }
    return this.getAccessMove(upDownMove);
  }

  horizontalMovementAccess() {

    const horizontalMove = [];
    let minInterval = 0;
    let maxInterval = this.gamePlay.boardSize - 1;

    while (true) {
      if (this.gameState.currentCharacterPosition.position <= maxInterval && this.gameState.currentCharacterPosition.position >= minInterval) {
        break;
      }
      minInterval = minInterval + this.gamePlay.boardSize;
      maxInterval = maxInterval + this.gamePlay.boardSize;
    }
    for (let i = minInterval; i <= maxInterval; i++) {
      horizontalMove.push(i);
    }

    return this.getAccessMove(horizontalMove);
  }

  getAccessMove(array) {
    this.getMoveAttack();

    const moveArr = [];
    let firstMove;
    let secondMove;

    const index = array.findIndex(el => el === this.gameState.currentCharacterPosition.position);

      ((index - this.gameState.attackMove.move) >= 0) ?
      firstMove = this.gameState.attackMove.move : firstMove = index;

    ((index + this.gameState.attackMove.move) <= (array.length - 1)) ?
      secondMove = this.gameState.attackMove.move : secondMove = (array.length - 1) - index;


    for (let i = (index - firstMove); i < index; i++) {
      moveArr.push(array[i])
    }
    for (let i = index + 1; i > index && i <= (index + secondMove); i++) {
      moveArr.push(array[i])
    }

    return moveArr;
  }


  getInfoCharacter(index) {
    const commonArr = [...this.gameState.teamPlayers, ...this.gameState.teamCompetitors];
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