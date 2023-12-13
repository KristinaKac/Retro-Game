import { Bowman } from './characters/Bowman';
import { Swordsman } from './characters/Swordsman';
import { Magician } from './characters/Magician';
import { Vampire } from './characters/Vampire';
import { Undead } from './characters/Undead';
import { Daemon } from './characters/Daemon';



export default class GameState {

  constructor() {

    this.move = 'player'; // opponent

    this.level = 1;

    this.enterIndex = null;
    this.enterCell = null;

    this.currentIndex = null;
    this.typeCurrentIndex = null;
    this.currentCharacterPosition = null;
    this.currentAttackMove = null;
    this.currentCell = null;

    this.teamPlayers = [];
    this.teamCompetitors = [];

    this.previousIndex = null;
    this.previousType = null;
    this.previousCharacterPosition = null;
    this.previousAttackMove = null;
    this.previousCell = null;

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

  }
  static from(object) {

    // TODO: create object
    return null;
  }

}
