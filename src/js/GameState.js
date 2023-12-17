import { Bowman } from './characters/Bowman';
import { Swordsman } from './characters/Swordsman';
import { Magician } from './characters/Magician';
import { Vampire } from './characters/Vampire';
import { Undead } from './characters/Undead';
import { Daemon } from './characters/Daemon';

export default class GameState {

  constructor() {

    // crt - current
    // char - character

    this.move = 'player';

    this.level = 1;
    this.amountParticipants = 2;

    this.enterIndex = null;
    this.enterCell = null;

    this.focusChar = {
      'current': false,
      'index': null,
      'type': null,
      'char': null,
      'position': null,
      'attack': null,
      'move': null,
      'cell': null
    }

    this.crtIndex = null;
    this.crtTypeIndex = null;
    this.crtCell = null;
    this.crtPosition = null;
    this.crtCharacter = null;
    this.crtAttack = null;
    this.crtMove = null;

    this.teamPlayers = [];
    this.teamCompetitors = [];

    this.playerTypes = [Bowman, Swordsman, Magician];
    this.competitorTypes = [Vampire, Undead, Daemon];

    this.moveRangeAttack = [
      { name: 'bowman', type: 'player', move: 2, attack: 2 },
      { name: 'swordsman', type: 'player', move: 4, attack: 1 },
      { name: 'magician', type: 'player', move: 1, attack: 4 },
      { name: 'vampire', type: 'competitor', move: 2, attack: 2 },
      { name: 'undead', type: 'competitor', move: 4, attack: 1 },
      { name: 'daemon', type: 'competitor', move: 1, attack: 4 }
    ];

    this.initPlayersPositions = null;
    this.initCompetitorsPositions = null;

  }
  static from(object) {

    // TODO: create object
    return null;
  }

}
