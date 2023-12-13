import { generateTeam } from './generators';
import { randomInitPositions } from './generators';
import {
  diagonalRightLeftFirstPart, diagonalRightLeftSecondPart, diagonalLeftRightFirstPart,
  diagonalLeftRightSecondPart, verticalMovementAccess, horizontalMovementAccess, availableAttack
} from './utils';


import GameState from './GameState';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  initPositions(column1, column2) {
    const arr = [];
    const board = this.gamePlay.boardSize;
    for (let i = 0; i < ((board * board) - 1); i++) {
      if (i % board === column1 || i % board === column2) {
        arr.push(i);
      }
    }
    return arr;
  }


  init() {
    this.levels();

    this.drawingPlayingField();

    this.addListeners();
  }

  drawingPlayingField() {

    const teamPlayers = generateTeam(this.gameState.playerTypes, 4, 4);
    const teamCompetitors = generateTeam(this.gameState.competitorTypes, 4, 4);

    const initPlayersPositions = this.initPositions(0, 1);
    const initCompetitorsPositions = this.initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2));

    this.gameState.teamPlayers = randomInitPositions(teamPlayers, initPlayersPositions);
    this.gameState.teamCompetitors = randomInitPositions(teamCompetitors, initCompetitorsPositions);

    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
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

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellEnter(index) {
    this.gameState.enterIndex = index;
    this.gameState.enterCell = this.gamePlay.cells[this.gameState.enterIndex];

    // отображение CellTooltip
    if (this.gameState.enterCell.children[0]) {
      this.gamePlay.showCellTooltip(this.showTooltipCharacter(index), index);
      this.gamePlay.setCursor('pointer');
    }

    if (this.gameState.typeCurrentIndex === 'character') {

      // отображение возможной клетки для хода
      this.displayOfAvailableMoves(index);

      // отображение возможной клетки для аттаки
      const attack = availableAttack(this.gameState.currentIndex, this.gameState.currentAttackMove, this.gamePlay.boardSize);

      this.gameState.teamCompetitors.forEach(el => {
        if (el.position === index && attack.includes(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor('crosshair');
        }
        if (el.position === index && !attack.includes(index)) {
          this.gamePlay.setCursor('not-allowed');
        }
      });
    }
  }

  showTooltipCharacter(index) {
    const arr = [...this.gameState.teamPlayers, ...this.gameState.teamCompetitors];
    const el = arr.find(el => el.position === index);
    return `\u{1F396}${el.character.level} \u{2694}${el.character.attack} \u{1F6E1}${el.character.defence} \u{2764}${el.character.health}`;
  }

  redrawingMove(character, newIndex, team) {
    team.find(el => { if (el === character) { el.position = newIndex } });
  }

  setCurrentCharacteristics(index, type, characterPosition, attackMove, cell) {
    this.gameState.currentIndex = index;
    this.gameState.typeCurrentIndex = type;
    this.gameState.currentCharacterPosition = characterPosition;
    this.gameState.currentAttackMove = attackMove;
    this.gameState.currentCell = cell;
  }

  async onCellClick(index) {
    this.gameState.currentIndex = index;
    this.setСlickСharacteristics();

    if (this.gameState.typeCurrentIndex === 'character') {

      // если нажали на одного и того же персонажа дважды - фокус убираем с него
      if (this.gameState.currentCell.className.includes('selected-yellow')) {
        this.gamePlay.deselectCell(this.gameState.currentIndex);

        this.setCurrentCharacteristics(null, null, null, null, null);
        return;
      }
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(this.gameState.currentIndex, 'yellow');
    }

    if (this.gameState.typeCurrentIndex === 'empty') {

      // если предыдущий выбор был персонаж - ход персонажа в пустую клетку
      if (this.gameState.previousType === 'character' && this.gameState.currentCell.className.includes('selected-green')) {
        this.redrawingMove(this.gameState.previousCharacterPosition, this.gameState.currentIndex, this.gameState.teamPlayers);
        this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);

        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        this.gamePlay.selectCell(this.gameState.currentIndex, 'yellow');

        this.setCurrentCharacteristics(this.gameState.currentIndex, this.gameState.previousType,
          this.gameState.previousCharacterPosition, this.gameState.previousAttackMove, this.gameState.previousCell)
      } else {
        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      }
    }
    if (this.gameState.typeCurrentIndex === 'competitor') {

      if (this.gameState.previousType === 'character') {
        const attack = availableAttack(this.gameState.previousIndex, this.gameState.previousAttackMove, this.gamePlay.boardSize);
        if (attack.includes(this.gameState.currentIndex)) {
          try {
            await this.attackCalculation(this.gameState.previousCharacterPosition.character, this.gameState.currentCharacterPosition.character, this.gameState.currentIndex);
          } catch (error) { }
          this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
        } else {
          GamePlay.showError('Невозможно атаковать данную клетку');
        }
        this.setCurrentCharacteristics(this.gameState.previousIndex, this.gameState.previousType,
          this.gameState.previousCharacterPosition, this.gameState.previousAttackMove, this.gameState.previousCell);
      } else {
        GamePlay.showError('Невозможно выбрать данного игрока');
      }
    }
    this.gameState.previousIndex = this.gameState.currentIndex;
    this.gameState.previousType = this.gameState.typeCurrentIndex;
    this.gameState.previousCharacterPosition = this.gameState.currentCharacterPosition;
    this.gameState.previousAttackMove = this.gameState.currentAttackMove;
    this.gameState.previousCell = this.gameState.currentCell;
  }

  // async moveOpponent() {
  //   this.move = 'opponent';

  //   const randomOpponent = this.gameState.teamCompetitors[Math.floor(Math.random() * this.gameState.teamCompetitors.length)];
  //   const moveAttack = this.gameState.moveRangeAttack.find(el => el.name === randomOpponent.character.type);

  //   let attack = this.availableAttack(randomOpponent.position, moveAttack);

  //   const arr = [];
  //   const newArr = [];

  //   attack = attack.forEach(el => {
  //     if (this.gamePlay.cells[el].children[0]) {
  //       arr.push(el);
  //     }
  //   });

  //   arr.forEach(el => {
  //     if (this.gamePlay.cells[el].children[0].className.includes('bowman') ||
  //       this.gamePlay.cells[el].children[0].className.includes('swordsman') ||
  //       this.gamePlay.cells[el].children[0].className.includes('magician')) {
  //       newArr.push(el);
  //     }
  //   });

  //   const randomTarget = newArr[Math.floor(Math.random() * newArr.length)]

  //   const target = this.gameState.teamPlayers.find(el => el.position === randomTarget);
  //   if (target) {
  //     try {
  //       await this.attackCalculation(randomOpponent.character, target.character, target.position);
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   } else {
  //     const array = [...horizontalMovementAccess(), ...verticalMovementAccess(),
  //     ...diagonalRightLeftFirstPart(), ...diagonalRightLeftSecondPart(), ...diagonalLeftRightFirstPart(),
  //     ...diagonalLeftRightSecondPart()];

  //     const randomMove = array[Math.floor(Math.random() * array.length)];
  //     console.log(randomMove)

  //     this.redrawingMove(randomOpponent, randomMove);

  //   }
  // }

  async attackCalculation(attacker, target, targetIndex) {
    const damage = Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
    try {
      await this.gamePlay.showDamage(targetIndex, damage);
    } catch (error) { }
    target.health = target.health - damage;

    // проверка мертв ли персонаж
    this.isCharacterDead(target, this.gameState.teamPlayers, targetIndex);
    this.isCharacterDead(target, this.gameState.teamCompetitors, targetIndex);

    // Проверка остались ли игроки
    const playersDead = this.isTeamDead(this.gameState.teamPlayers);
    const competitorsDead = this.isTeamDead(this.gameState.teamCompetitors);
  }

  isCharacterDead(target, team, targetIndex) {
    if (target.health <= 0) {
      team.forEach((el, index, array) => {
        if (el.character === target) {
          this.gamePlay.hideCellTooltip(targetIndex);
          array.splice(index, 1);
        }
      });
    }
  }

  isTeamDead(team) {
    if (team.length === 0) {
      return true;
    }
    return false;
  }

  onCellLeave(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
    } else {
      this.gamePlay.deselectCell(index);
    }
    if (this.gameState.typeCurrentIndex === 'character') {
      const el = this.gameState.teamCompetitors.find(el => el.position === index);
      if (el) {
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor('auto');
      }
    }
    if (this.gameState.typeCurrentIndex === 'competitor') {
      this.gamePlay.deselectCell(index);
    }
  }
  displayOfAvailableMoves(index) {
    const position = this.gameState.currentCharacterPosition.position;
    const boardSize = this.gamePlay.boardSize;
    const move = this.gameState.currentAttackMove.move;

    const horizontal = this.selectNextMove(horizontalMovementAccess(position, boardSize, move), index);
    const vertical = this.selectNextMove(verticalMovementAccess(position, boardSize, move), index);
    const diagonal1 = this.selectNextMove(diagonalRightLeftFirstPart(position, boardSize, move), index);
    const diagonal2 = this.selectNextMove(diagonalRightLeftSecondPart(position, boardSize, move), index);
    const diagonal3 = this.selectNextMove(diagonalLeftRightFirstPart(position, boardSize, move), index);
    const diagonal4 = this.selectNextMove(diagonalLeftRightSecondPart(position, boardSize, move), index);

    const arr = [horizontal, vertical, diagonal1, diagonal2, diagonal3, diagonal4];

    if (arr.includes(index)) { return index };
  }
  selectNextMove(accessMove, index) {
    accessMove.forEach(el => {
      if (el === index && !this.gamePlay.cells[index].children[0]) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(index, 'green');
        return index;
      }
    });
  }
  setСlickСharacteristics() {
    this.gameState.currentCell = this.gamePlay.cells[this.gameState.currentIndex];

    // если клик по пустому полю
    if (!this.gameState.currentCell.children[0]) {
      this.gameState.typeCurrentIndex = 'empty';
      this.gameState.currentCharacterPosition = null;
      this.gameState.currentAttackMove = null;
      return;
    }
    // Если клик не по пустому полю: определяем из чьей команды игрок
    const ourPlayer = this.playerOrCompetitor(this.gameState.teamPlayers, this.gameState.currentCell, this.gameState.currentIndex);
    const competitor = this.playerOrCompetitor(this.gameState.teamCompetitors, this.gameState.currentCell, this.gameState.currentIndex);

    if (ourPlayer) {
      this.gameState.typeCurrentIndex = 'character';
      this.gameState.currentCharacterPosition = ourPlayer;
    } else {
      this.gameState.typeCurrentIndex = 'competitor';
      this.gameState.currentCharacterPosition = competitor;
    }
    this.gameState.currentAttackMove = this.getMoveAttack(this.gameState.currentCharacterPosition);
  }
  playerOrCompetitor(team, cell, index) {
    return team.find(el => cell.children[0].className.includes(el.character.type) && el.position === index);
  }
  getMoveAttack(positionedCharacter) {
    if (positionedCharacter) {
      return this.gameState.moveRangeAttack.find(el => el.name === positionedCharacter.character.type);
    }
    return null;
  }
}