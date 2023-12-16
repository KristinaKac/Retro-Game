import { generateTeam } from './generators';
import { randomInitPositions } from './generators';
import {
  diagonalRightLeftFirstPart, diagonalRightLeftSecondPart, diagonalLeftRightFirstPart,
  diagonalLeftRightSecondPart, verticalMovementAccess, horizontalMovementAccess, availableAttack
} from './utils';

import GameState from './GameState';
import GamePlay from './GamePlay';
import Team from './Team';
import { Bowman } from './characters/Bowman';
import Character from './Character';

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

    this.gameState = new GameState();

    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];

    this.levels();

    const teamPlayers = generateTeam(this.gameState.playerTypes, 1, this.gameState.amountParticipants);
    const teamCompetitors = generateTeam(this.gameState.competitorTypes, 1, this.gameState.amountParticipants);

    this.drawingPlayingField(teamPlayers, teamCompetitors);

    this.addListeners();
  }

  levels() {
    switch (this.gameState.level) {
      case 1:
        this.gamePlay.drawUi('prairie');
        this.gameState.amountParticipants = 2;
        break;
      case 2:
        this.gamePlay.drawUi('desert');
        this.gameState.amountParticipants = 3;
        break;
      case 3:
        this.gamePlay.drawUi('arctic');
        this.gameState.amountParticipants = 4;
        break;
      case 4:
        this.gamePlay.drawUi('mountain');
        this.gameState.amountParticipants = 5;
        break;
    }
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));

    const btn = document.querySelectorAll('.btn');
    btn.forEach(el => el.addEventListener('mouseover', function () { el.style.cursor = 'pointer' }))
  }
  onNewGameClick() {
    this.init();
  }
  onSaveGameClick() {
    this.stateService.save(this.gameState);
  }
  onLoadGameClick() {
    const loadedState = this.stateService.load();
    
    if (!loadedState) {
      throw new Error('Доступных сохранений нет.');
    }

    this.gameState.move = loadedState.move;

    this.gameState.level = loadedState.level;
    this.levels();

    this.gameState.teamPlayers = loadedState.teamPlayers;
    this.gameState.teamCompetitors = loadedState.teamCompetitors;

    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];

    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);

    this.addListeners();
  }

  onCellEnter(index) {
    this.gameState.enterIndex = index;
    this.gameState.enterCell = this.gamePlay.cells[this.gameState.enterIndex];

    // отображение CellTooltip
    if (this.gameState.enterCell.children[0]) {
      this.gamePlay.showCellTooltip(this.showTooltipCharacter(index), index);
      this.gamePlay.setCursor('pointer');
    }
    if (this.gameState.focusCharacter.current === true) {

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
    if (el) {
      return `\u{1F396}${el.character.level} \u{2694}${el.character.attack} \u{1F6E1}${el.character.defence} \u{2764}${el.character.health}`;
    }
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
    if (this.gameState.move === 'player') {

      this.gameState.currentIndex = index;
      this.setСlickСharacteristics();

      if (this.gameState.typeCurrentIndex === 'character') {

        // если нажали на одного и того же персонажа дважды - фокус убираем с него
        if (this.gameState.currentCell.className.includes('selected-yellow')) {
          this.gamePlay.deselectCell(this.gameState.currentIndex);
          this.gameState.focusCharacter = {
            'current': false,
            'index': null,
            'type': null,
            'positionedCharacter': null,
            'attackMove': null,
            'cell': null
          }

          this.setCurrentCharacteristics(null, null, null, null, null);
          return;
        }
        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        this.gamePlay.selectCell(this.gameState.currentIndex, 'yellow');

        this.gameState.focusCharacter = {
          'current': true,
          'index': this.gameState.currentIndex,
          'type': this.gameState.typeCurrentIndex,
          'positionedCharacter': this.gameState.currentCharacterPosition,
          'attackMove': this.gameState.currentAttackMove,
          'cell': this.gameState.currentCell
        }
      }

      if (this.gameState.typeCurrentIndex === 'empty') {

        if (this.gameState.focusCharacter.current === true && this.gameState.currentCell.className.includes('selected-green')) {

          this.gameState.focusCharacter.index = this.gameState.currentIndex;
          this.gameState.focusCharacter.positionedCharacter.position = this.gameState.currentIndex;
          this.gameState.focusCharacter.cell = this.gameState.currentCell;

          this.redrawingMove(this.gameState.focusCharacter.index, this.gameState.currentIndex, this.gameState.teamPlayers);
          this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);

          this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
          this.gamePlay.selectCell(this.gameState.currentIndex, 'yellow');

          this.setCurrentCharacteristics(this.gameState.currentIndex, this.gameState.focusCharacter.type,
            this.gameState.focusCharacter.positionedCharacter, this.gameState.focusCharacter.attackMove, this.gameState.focusCharacter.cell)
          this.gameState.move = 'competitor'
          this.moveCompetitor();

        } else {
          this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
          this.setCurrentCharacteristics(null, null, null, null, null);
          this.gameState.focusCharacter = {
            'current': false,
            'index': null,
            'type': null,
            'positionedCharacter': null,
            'attackMove': null,
            'cell': null
          }
        }
      }
      if (this.gameState.typeCurrentIndex === 'competitor') {

        if (this.gameState.focusCharacter.current === true) {
          const attack = availableAttack(this.gameState.focusCharacter.index, this.gameState.focusCharacter.attackMove, this.gamePlay.boardSize);
          if (attack.includes(this.gameState.currentIndex)) {
            try {
              await this.attackCalculation(this.gameState.focusCharacter.positionedCharacter.character, this.gameState.currentCharacterPosition.character, this.gameState.currentIndex);
            } catch (error) { }

            if (this.checkNextLevel() === 'player') {
              this.gameState.move = 'player';
            } else {
              this.gameState.move = 'competitor';
            }

            this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
          } else {
            GamePlay.showError('Невозможно атаковать данную клетку');
          }
          this.setCurrentCharacteristics(this.gameState.focusCharacter.index, this.gameState.focusCharacter.type,
            this.gameState.focusCharacter.positionedCharacter, this.gameState.focusCharacter.attackMove, this.gameState.focusCharacter.cell);

          this.moveCompetitor();

        } else {
          this.gameState.focusCharacter = {
            'current': false,
            'index': null,
            'type': null,
            'positionedCharacter': null,
            'attackMove': null,
            'cell': null
          }
          GamePlay.showError('Невозможно выбрать данного игрока');
        }
      }
    }
  }

  async moveCompetitor() {

    if (this.gameState.move === 'competitor') {

      const randomCompetitor = this.gameState.teamCompetitors[Math.floor(Math.random() * this.gameState.teamCompetitors.length)];
      const moveAttackCompetitor = this.gameState.moveRangeAttack.find(el => el.name === randomCompetitor.character.type);
      const attack = availableAttack(randomCompetitor.position, moveAttackCompetitor, this.gamePlay.boardSize);

      const players = this.gameState.teamPlayers.filter(el => attack.includes(el.position));

      if (players.length !== 0) {

        const randomTarget = players[Math.floor(Math.random() * players.length)];

        try {
          await this.attackCalculation(randomCompetitor.character, randomTarget.character, randomTarget.position);
        } catch (error) { }

        this.checkNextLevel();

        this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
      } else {
        const position = this.gameState.currentCharacterPosition.position;
        const boardSize = this.gamePlay.boardSize;
        const move = this.gameState.currentAttackMove.move;

        let array =
          [...horizontalMovementAccess(position, boardSize, move),
          ...verticalMovementAccess(position, boardSize, move),
          ...diagonalRightLeftFirstPart(position, boardSize, move),
          ...diagonalRightLeftSecondPart(position, boardSize, move),
          ...diagonalLeftRightFirstPart(position, boardSize, move),
          ...diagonalLeftRightSecondPart(position, boardSize, move)];

        array = array.filter(el => !this.gamePlay.cells[el].children[0]);

        const randomMove = array[Math.floor(Math.random() * array.length)];
        this.redrawingMove(randomCompetitor, randomMove, this.gameState.teamCompetitors);
        this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
      }
      this.gameState.move = 'player';
    }
  }

  async attackCalculation(attacker, target, targetIndex) {
    const damage = Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
    try {
      await this.gamePlay.showDamage(targetIndex, damage);
    } catch (error) { }
    target.health = target.health - damage;

    // проверка мертв ли персонаж
    const isPlayerDead = this.isCharacterDead(target, this.gameState.teamPlayers, targetIndex);
    const isCompetitorDead = this.isCharacterDead(target, this.gameState.teamCompetitors, targetIndex);

    if (isPlayerDead && this.gameState.focusCharacter.current === true) {
      this.gameState.focusCharacter = {
        'current': false,
        'index': null,
        'type': null,
        'positionedCharacter': null,
        'attackMove': null,
        'cell': null
      }
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    }
  }

  isCharacterDead(target, team, targetIndex) {
    let result = false;
    if (target.health <= 0) {
      team.forEach((el, index, array) => {
        if (el.character === target) {
          this.gamePlay.hideCellTooltip(targetIndex);
          array.splice(index, 1);
          result = true;
        }
      })
    }
    return result;
  }

  isTeamDead(team) {
    if (team.length === 0) {
      return true;
    }
    return false;
  }

  updateWinners(team) {
    let updateTeam = [];

    team.forEach(el => {
      if (el.character.level > 4) {
        updateTeam.push(el.character);
        return;
      }

      el.character.level++;

      el.character.attack = Math.floor(Math.max(el.character.attack, el.character.attack * (80 + el.character.health) / 100));
      el.character.defence = Math.floor(Math.max(el.character.defence, el.character.defence * (80 + el.character.health) / 100));

      el.character.health = el.character.health + 80;

      el.character.health > 100 ? el.character.health = 100 : el.character.health;

      updateTeam.push(el.character);
    });
    return updateTeam
  }

  drawingPlayingField(teamPlayers, teamCompetitors) {

    this.gameState.initPlayersPositions = this.initPositions(0, 1);
    this.gameState.initCompetitorsPositions = this.initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2));

    this.gameState.teamPlayers = randomInitPositions(teamPlayers, this.gameState.initPlayersPositions);
    this.gameState.teamCompetitors = randomInitPositions(teamCompetitors, this.gameState.initCompetitorsPositions);

    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
  }

  checkNextLevel() {
    // Проверка остались ли игроки
    const playersDead = this.isTeamDead(this.gameState.teamPlayers);
    const competitorsDead = this.isTeamDead(this.gameState.teamCompetitors);

    if ((playersDead === true && this.gameState.level === 4) ||
      (competitorsDead === true && this.gameState.level === 4) ||
      (playersDead === true)) {
      this.gamePlay.boardEl.style.pointerEvents = 'none';
    }
    if (competitorsDead === true) {

      this.gameState.level++;
      this.levels();

      let updatedPlayers = this.updateWinners(this.gameState.teamPlayers);
      const generatePlayers = this.gameState.amountParticipants - this.gameState.teamPlayers.length;

      updatedPlayers = updatedPlayers.map((item) => {
        const obj = Object.setPrototypeOf(item, Character.prototype);
        return obj;
      });

      const teamPlayers = generateTeam(this.gameState.playerTypes, 1, generatePlayers, updatedPlayers);
      const teamCompetitors = generateTeam(this.gameState.competitorTypes, 1, this.gameState.amountParticipants);

      this.drawingPlayingField(teamPlayers, teamCompetitors);
      return 'player';
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