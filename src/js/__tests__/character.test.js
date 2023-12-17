import Character from '../Character';
import { Bowman } from '../characters/Bowman';

test('it is impossible to create an instance of the class Character', () => {
  expect(() => {
    new Character(1);
  }).toThrowError('Нельзя создавать экземпляры данного класса.');
});

test('Error is not thrown when creating objects of inherited classes, first level characters contain the correct characteristics', () => {
  const result = new Bowman(1);
  expect(result).toEqual({
    level: 1, attack: 25, defence: 25, health: 100, type: 'bowman',
  });
});
