import Character from '../Character';

export class Undead extends Character {
  constructor(level) {
    super(level);
    this.attack = 40;
    this.defence = 10;
    this.type = 'undead';
  }
}
