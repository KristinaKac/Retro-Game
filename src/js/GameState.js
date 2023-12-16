import { Bowman } from './characters/Bowman';
import { Swordsman } from './characters/Swordsman';
import { Magician } from './characters/Magician';
import { Vampire } from './characters/Vampire';
import { Undead } from './characters/Undead';
import { Daemon } from './characters/Daemon';




export default class GameState {

  constructor() {

    this.move = 'player';

    this.level = 1;
    this.amountParticipants = 2;

    this.enterIndex = null;
    this.enterCell = null;

    this.focusCharacter = false;

    this.currentIndex = null;
    this.typeCurrentIndex = null;
    this.currentCharacterPosition = null;
    this.currentAttackMove = null;
    this.currentCell = null;

    this.r = null;

    this.teamPlayers = [];
    this.teamCompetitors = [];

    this.playerTypes = [Bowman, Swordsman, Magician];
    this.competitorTypes = [Vampire, Undead, Daemon];

    this.moveRangeAttack = [
      { name: 'bowman', type: 'player', move: 2, attackRange: 2 },
      { name: 'swordsman', type: 'player', move: 4, attackRange: 1 },
      { name: 'magician', type: 'player', move: 1, attackRange: 4 },
      { name: 'vampire', type: 'competitor', move: 2, attackRange: 2 },
      { name: 'undead', type: 'competitor', move: 4, attackRange: 1 },
      { name: 'daemon', type: 'competitor', move: 1, attackRange: 4 }
    ];

    this.initPlayersPositions = null;
    this.initCompetitorsPositions = null;

  }
  static from(object) {

    // TODO: create object
    return null;
  }

}
