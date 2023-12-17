import Character from '../Character';

export class Bowman extends Character {
  constructor(level) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
  }
}
