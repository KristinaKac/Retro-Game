import { characterGenerator } from '../generators';
import { generateTeam } from '../generators';
import { Bowman } from '../characters/Bowman';
import { Swordsman } from '../characters/Swordsman';
import { Magician } from '../characters/Magician';

test('characterGenerator produces characters from a list', () => {
    const arr = [];
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 2;
    const playerGenerator = characterGenerator(allowedTypes, maxLevel);

    for (let i = 0; i < 5; i++) {
        arr.push(playerGenerator.next().value);
    }
    const result = arr.map(element => {
        if (element.type === 'bowman' || element.type === 'swordsman' || element.type === 'magician') {
            return true;
        };
    });
    expect(result).toStrictEqual([true, true, true, true, true]);
});

test('testing the number of characters when calling generateTeam', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 2;
    const characterCount = 15;
    const result = generateTeam(allowedTypes, maxLevel, characterCount);
    expect(result.characters.length).toBe(15);
});

test('testing the level of characters when calling generateTeam', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 3;
    const characterCount = 2;
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    const result = team.characters.map(element => {
        if (element.level <= maxLevel && element.level > 0) {
            return true;
        }
    });
    expect(result).toStrictEqual([true, true]);
});