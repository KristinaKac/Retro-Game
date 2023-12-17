import { generateTeam } from './generators';
import { randomInitPositions } from './generators';
import {
  diagonalRightLeftFirstPart, diagonalRightLeftSecondPart, diagonalLeftRightFirstPart,
  diagonalLeftRightSecondPart, verticalMovementAccess, horizontalMovementAccess, availableAttack, initPositions
} from './utils';

import GameState from './GameState';
import GamePlay from './GamePlay';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
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

    const btn = document.querySelectorAll('.btn');
    btn.forEach(el => el.addEventListener('mouseover', function () { el.style.cursor = 'pointer' }))

    if (this.gameState.enterCell.children[0]) {

      // отображение CellTooltip
      this.gamePlay.showCellTooltip(this.showTooltipCharacter(index), index);

      const isCompetitor = this.playerOrCompetitor(this.gameState.teamCompetitors, this.gameState.enterCell, this.gameState.enterIndex);
      isCompetitor ? this.gamePlay.setCursor('auto') : this.gamePlay.setCursor('pointer');
    }

    if (this.gameState.focusChar.current === true) {

      // отображение возможной клетки для хода
      const availableMoves = this.getAllAvailableMoves(this.gameState.crtPosition, this.gameState.crtMove, this.gamePlay.boardSize);
      availableMoves.forEach(el => {
        if (el === index && !this.gamePlay.cells[index].children[0]) {
          this.gamePlay.setCursor('pointer');
          this.gamePlay.selectCell(index, 'green');
        }
      });

      if (!availableMoves.includes(this.gameState.enterIndex)) {
        this.gamePlay.setCursor('auto');
      }

      // отображение возможной клетки для аттаки
      const attack = availableAttack(this.gameState.crtIndex, this.gameState.crtAttack, this.gamePlay.boardSize);

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

  async onCellClick(index) {
    if (this.gameState.move === 'player') {

      this.gameState.crtIndex = index;
      this.setСlickСharacteristics();

      if (this.gameState.crtTypeIndex === 'character') {

        // если нажали на одного и того же персонажа дважды - фокус убираем с него
        if (this.gameState.crtCell.className.includes('selected-yellow')) {
          this.gamePlay.deselectCell(this.gameState.crtIndex);
          this.resetFocusCharacter();

          this.setCurrentCharacteristics(null, null, null, null, null, null, null);
          return;
        }
        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        this.gamePlay.selectCell(this.gameState.crtIndex, 'yellow');

        this.gameState.focusChar = {
          'current': true,
          'index': this.gameState.crtIndex,
          'type': this.gameState.crtTypeIndex,
          'char': this.gameState.crtCharacter,
          'position': this.gameState.crtPosition,
          'attack': this.gameState.crtAttack,
          'move': this.gameState.crtMove,
          'cell': this.gameState.crtCell
        }
      }

      if (this.gameState.crtTypeIndex === 'empty') {

        if (this.gameState.focusChar.current === true && this.gameState.crtCell.className.includes('selected-green')) {

          this.gameState.focusChar.index = this.gameState.crtIndex;
          this.gameState.focusChar.position = this.gameState.crtIndex;
          this.gameState.focusChar.cell = this.gameState.crtCell;

          this.changeCharacterPosition(this.gameState.focusChar.char, this.gameState.crtIndex, this.gameState.teamPlayers);
          this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);

          this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
          this.gamePlay.selectCell(this.gameState.crtIndex, 'yellow');

          this.setCurrentCharacteristics(this.gameState.crtIndex, this.gameState.focusChar.type,
            this.gameState.focusChar.char, this.gameState.focusChar.position, this.gameState.focusChar.attack,
            this.gameState.focusChar.move, this.gameState.focusChar.cell);

          this.gameState.move = 'competitor'
          this.moveCompetitor();

        } else {
          this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
          this.setCurrentCharacteristics(null, null, null, null, null, null, null);
          this.resetFocusCharacter();
        }
      }
      if (this.gameState.crtTypeIndex === 'competitor') {

        if (this.gameState.focusChar.current === true) {

          const attack = availableAttack(this.gameState.focusChar.index, this.gameState.focusChar.attack, this.gamePlay.boardSize);
          if (attack.includes(this.gameState.crtIndex)) {
            try {
              await this.attackCalculation(this.gameState.focusChar.char, this.gameState.crtCharacter, this.gameState.crtIndex);
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
          this.setCurrentCharacteristics(this.gameState.focusChar.index, this.gameState.focusChar.type,
            this.gameState.focusChar.char, this.gameState.focusChar.position, this.gameState.focusChar.attack,
            this.gameState.focusChar.move, this.gameState.focusChar.cell);

          this.moveCompetitor();

        } else {
          this.resetFocusCharacter();
          GamePlay.showError('Невозможно выбрать данного игрока');
        }
      }
    }
  }

  onCellLeave(index) {
    if (this.gamePlay.cells[index].children[0]) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
    } else {
      this.gamePlay.deselectCell(index);
    }
    if (this.gameState.crtTypeIndex === 'character') {
      const el = this.gameState.teamCompetitors.find(el => el.position === index);
      if (el) {
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor('auto');
      }
    }
    if (this.gameState.crtTypeIndex === 'competitor') {
      this.gamePlay.deselectCell(index);
    }
  }

  setCurrentCharacteristics(index, type, char, position, attack, move, cell) {
    this.gameState.crtIndex = index;
    this.gameState.crtTypeIndex = type;
    this.gameState.crtChar = char;
    this.gameState.crtPosition = position;
    this.gameState.crtAttack = attack;
    this.gameState.crtMove = move;
    this.gameState.crtCell = cell;
  }

  resetFocusCharacter() {
    this.gameState.focusChar = {
      'current': false,
      'index': null,
      'type': null,
      'char': null,
      'position': null,
      'attack': null,
      'move': null,
      'cell': null
    }
  }

  changeCharacterPosition(character, newIndex, team) {
    team.find(el => { if (el.character === character) { el.position = newIndex } });
  }

  async moveCompetitor() {

    if (this.gameState.move === 'competitor' && this.gameState.teamCompetitors.length != 0) {

      const positionedCompetitor = this.gameState.teamCompetitors[Math.floor(Math.random() * this.gameState.teamCompetitors.length)];

      const attackCompetitor = this.getCellAttack(positionedCompetitor.character);

      const attack = availableAttack(positionedCompetitor.position, attackCompetitor, this.gamePlay.boardSize);

      const players = this.gameState.teamPlayers.filter(el => attack.includes(el.position));

      if (players.length !== 0) {

        const randomTarget = players[Math.floor(Math.random() * players.length)];

        try {
          await this.attackCalculation(positionedCompetitor.character, randomTarget.character, randomTarget.position);
        } catch (error) { }

        this.checkNextLevel();

        this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
      } else {
        let array = this.getAllAvailableMoves(this.gameState.crtPosition, this.gameState.crtMove, this.gamePlay.boardSize);
        array = array.filter(el => !this.gamePlay.cells[el].children[0]);
        const randomMove = array[Math.floor(Math.random() * array.length)];

        this.changeCharacterPosition(positionedCompetitor.character, randomMove, this.gameState.teamCompetitors);
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

    if (isPlayerDead && this.gameState.focusChar.current === true &&
      this.gameState.focusChar.char === target) {
      this.resetFocusCharacter();
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    }
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

    this.gameState.initPlayersPositions = initPositions(0, 1, this.gamePlay.boardSize);
    this.gameState.initCompetitorsPositions = initPositions((this.gamePlay.boardSize - 1), (this.gamePlay.boardSize - 2), this.gamePlay.boardSize);

    this.gameState.teamPlayers = randomInitPositions(teamPlayers, this.gameState.initPlayersPositions);
    this.gameState.teamCompetitors = randomInitPositions(teamCompetitors, this.gameState.initCompetitorsPositions);

    this.gamePlay.redrawPositions([...this.gameState.teamPlayers, ...this.gameState.teamCompetitors]);
  }

  setСlickСharacteristics() {
    this.gameState.crtCell = this.gamePlay.cells[this.gameState.crtIndex];

    // если клик по пустому полю
    if (!this.gameState.crtCell.children[0]) {
      this.gameState.crtTypeIndex = 'empty';
      this.gameState.crtCharacter = null;
      this.gameState.crtPosition = null;
      this.gameState.crtAttack = null;
      this.gameState.crtMove = null;
      return;
    }
    // Если клик не по пустому полю: определяем из чьей команды игрок
    const ourPlayer = this.playerOrCompetitor(this.gameState.teamPlayers, this.gameState.crtCell, this.gameState.crtIndex);
    const competitor = this.playerOrCompetitor(this.gameState.teamCompetitors, this.gameState.crtCell, this.gameState.crtIndex);

    if (ourPlayer) {
      this.gameState.crtTypeIndex = 'character';
      this.gameState.crtCharacter = ourPlayer.character;
      this.gameState.crtPosition = ourPlayer.position;
    } else {
      this.gameState.crtTypeIndex = 'competitor';
      this.gameState.crtCharacter = competitor.character;
      this.gameState.crtPosition = competitor.position;
    }
    this.gameState.crtAttack = this.getCellAttack(this.gameState.crtCharacter);
    this.gameState.crtMove = this.getCellMove(this.gameState.crtCharacter);
  }

  getCellMove(character) {
    if (character) {
      const charMoveAttack = this.gameState.moveRangeAttack.find(el => el.name === character.type);
      return charMoveAttack.move;
    }
    return null;
  }

  getCellAttack(character) {
    if (character) {
      const charMoveAttack = this.gameState.moveRangeAttack.find(el => el.name === character.type);
      return charMoveAttack.attack;
    }
    return null;
  }

  checkNextLevel() {
    // Проверка: остались ли игроки
    const playersDead = this.isTeamDead(this.gameState.teamPlayers);
    const competitorsDead = this.isTeamDead(this.gameState.teamCompetitors);

    if ((playersDead === true && this.gameState.level === 4) ||
      (competitorsDead === true && this.gameState.level === 4) ||
      (playersDead === true)) {
      this.gamePlay.boardEl.style.pointerEvents = 'none';
      return;
    }
    if (competitorsDead === true) {

      this.gameState.level++;
      this.levels();
      this.resetFocusCharacter();

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

  playerOrCompetitor(team, cell, index) {
    return team.find(el => cell.children[0].className.includes(el.character.type) && el.position === index);
  }

  getAllAvailableMoves(position, move, boardSize) {
    let array =
      [...horizontalMovementAccess(position, boardSize, move), ...verticalMovementAccess(position, boardSize, move),
      ...diagonalRightLeftFirstPart(position, boardSize, move), ...diagonalRightLeftSecondPart(position, boardSize, move),
      ...diagonalLeftRightFirstPart(position, boardSize, move), ...diagonalLeftRightSecondPart(position, boardSize, move)];

    return array;
  }
}