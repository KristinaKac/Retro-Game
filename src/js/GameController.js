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
import { calcTileType } from './utils';


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

    this.levels();

    const teamPlayers = generateTeam(this.gameState.playerTypes, 4, 4);
    const teamCompetitors = generateTeam(this.gameState.competitorTypes, 4, 4);

    this.initPositions(0, 1, this.initPlayersPositions);
    this.initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2), this.initCompetitorsPositions);


    randomInitPositions(teamPlayers, this.initPlayersPositions, this.gameState.teamPlayers);
    randomInitPositions(teamCompetitors, this.initCompetitorsPositions, this.gameState.teamCompetitors);


    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
    this.someMethodName();
  }

  levels() {
    switch (this.gameState.level) {
      case 1:
        this.gamePlay.drawUi('prairie');
        break;
      case 2:
        this.gamePlay.drawUi('desert');
        break;
      case 3:
        this.gamePlay.drawUi('arctic');
        break;
      case 4:
        this.gamePlay.drawUi('mountain');
        break;
    }
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

  onCellEnter(index) {
    this.gameState.enterIndex = index;

    if (this.gamePlay.cells[this.gameState.enterIndex].children[0]) {
      this.gamePlay.showCellTooltip(this.getInfoCharacter(this.gameState.enterIndex), this.gameState.enterIndex);
      this.gamePlay.setCursor('pointer');
    }
    this.displayOfAvailableMoves(this.gameState.enterIndex);

    if (this.gameState.typeCurrentIndex === 'character') {
      const attack = this.availableAttack(this.gameState.currentIndex, this.gameState.attackMove);
      const competitorsPositions = [];
      this.gameState.teamCompetitors.filter(el => competitorsPositions.push(el.position));

      if (attack.includes(this.gameState.enterIndex) && competitorsPositions.includes(this.gameState.enterIndex)) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor('crosshair');
      }
    }
  }

  async onCellClick(index) {
    this.gameState.currentIndex = index;

    this.typeCurrentIndex();
    this.getMoveAttack();

    if (this.gameState.typeCurrentIndex === 'character') {
      if (this.gamePlay.cells[this.gameState.currentIndex].className.includes('selected-yellow')) {
        this.gamePlay.deselectCell(this.gameState.currentIndex);

        this.gameState.currentIndex = null;
        this.gameState.typeCurrentIndex = null;
        this.gameState.currentCharacterPosition = null;
        return;
      }
      if (this.gameState.previousIndex != -1) {
        this.gamePlay.deselectCell(this.gameState.previousIndex);
      }
      this.gamePlay.selectCell(index, 'yellow');
      // this.availableAttack();
    }

    if (this.gameState.typeCurrentIndex === 'empty') {
      if (this.gameState.previousIndex != -1) {
        this.gamePlay.deselectCell(this.gameState.previousIndex);
      }

      if (this.gameState.previousType === 'character') {
        if (this.gamePlay.cells[this.gameState.currentIndex].className.includes('selected-green')) {
          this.redrawingMove(this.gameState.previousCharacterPosition);
          this.gamePlay.deselectCell(this.gameState.currentIndex);
        }
      }
    }

    if (this.gameState.typeCurrentIndex === 'competitor') {
      if (this.gameState.previousIndex != -1) {
        this.gamePlay.deselectCell(this.gameState.previousIndex);
      }
      if (this.gameState.previousType === 'character') {
        const attack = this.availableAttack(this.gameState.previousIndex, this.gameState.previousAttackMove);
        if (attack.includes(this.gameState.currentIndex)) {
          try {
            await this.attackCalculation(this.gameState.previousCharacterPosition.character, this.gameState.currentCharacterPosition.character, this.gameState.currentIndex);
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    this.gameState.previousIndex = this.gameState.currentIndex;
    this.gameState.previousType = this.gameState.typeCurrentIndex;
    this.gameState.previousCharacterPosition = this.gameState.currentCharacterPosition;
    this.gameState.previousAttackMove = this.gameState.attackMove;
  }

  async attackCalculation(attacker, target, targetIndex) {
    const damage = Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
    console.log(damage)
    try {
      await this.gamePlay.showDamage(targetIndex, damage);
    } catch (error) {
      console.log(error)
    }
    target.health = target.health - damage;


    // проверка мертв ли персонаж
    this.checkDeath(target);
    // Проверка остались ли игроки
    this.checkCharacters();

    console.log(this.gameState.teamCompetitors);

    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
  }

  checkDeath(target) {
    if (target.health <= 0) {
      this.gameState.teamPlayers.forEach((el, index, array) => { if (el.character === target) { array.splice(index, 1) } });
      this.gameState.teamCompetitors.forEach((el, index, array) => { if (el.character === target) { array.splice(index, 1) } })
    }
  }
  checkCharacters() {
    if (this.gameState.teamPlayers.length === 0 || this.gameState.teamCompetitors.length === 0) {
      this.gameState.level++;
      this.levels();
    }
  }

  onCellLeave(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
    } else {
      this.gamePlay.deselectCell(index);
    }
    if (this.gameState.typeCurrentIndex === 'character') {
      const competitorsPositions = [];
      this.gameState.teamCompetitors.filter(el => competitorsPositions.push(el.position));
      if (competitorsPositions.includes(index)) {
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor('auto');
      }
    }
  }

  redrawingMove(character) {
    this.gameState.teamPlayers.find(el => { if (el === character) { el.position = this.gameState.currentIndex } });
    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
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

    const competit = this.gameState.teamCompetitors.find(el =>
      this.gamePlay.cells[this.gameState.currentIndex].children[0].className.includes(el.character.type) &&
      el.position === this.gameState.currentIndex
    )
    this.gameState.typeCurrentIndex = 'competitor';
    this.gameState.currentCharacterPosition = competit;
    // return GamePlay.showError('Ошибка');
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

  availableAttack(index, attack) {

    const board = this.gamePlay.boardSize; // 8

    let leftMove = index;
    let rightMove = index;

    const top = [];
    const left = [];
    const right = [];
    const bottom = [];
    for (let i = 0; i < board; i++) {
      top.push(i);
      left.push(i * board);
      right.push(i * board + (board - 1))
      bottom.push(board * board - board + i);
    }

    for (let i = 1; i <= attack.attackRange; i++) {
      if (right.includes(rightMove)) {
        break;
      }
      rightMove = rightMove + 1;
    }
    for (let i = 1; i <= attack.attackRange; i++) {
      if (left.includes(leftMove)) {
        break;
      }
      leftMove = leftMove - 1;
    }
    let upMove = leftMove;
    for (let i = 1; i <= attack.attackRange; i++) {
      if (top.includes(upMove)) {
        break;
      }
      upMove = upMove - board;
    }
    let bottomMove = leftMove;
    for (let i = 1; i <= attack.attackRange; i++) {
      if (bottom.includes(bottomMove)) {
        break;
      }
      bottomMove = bottomMove + board;
    }

    const lengthHorizontal = rightMove - leftMove + 1;

    let availableAttack = [];


    for (let i = 0; i < lengthHorizontal; i++) {
      for (let j = upMove; j <= bottomMove; j = j + board) {
        availableAttack.push(i + j);
      }
      bottomMove = bottomMove + 1;
    }

    availableAttack = availableAttack.filter(el => el != index);

    return availableAttack;
  }
}