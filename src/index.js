import './css/style.css';
import './js/app';

import Character from './js/Character';
import { Bowman } from './js/characters/Bowman';
import { Swordsman } from './js/characters/Swordsman';
import { Magician } from './js/characters/Magician';
import {characterGenerator} from './js/generators';
import Team from './js/Team';
import PositionedCharacter from './js/PositionedCharacter';

import { generateTeam } from './js/generators';
// import { characterGenerator } from './js/generators';

// const playerTypes = [Bowman, Swordsman, Magician]; // доступные классы игрока
// const team = generateTeam(playerTypes, 3, 4);

// console.log(team)

// const character = new Bowman(2);
// const position = 8; // для поля 8x8 лучник будет находиться слева на второй строке
// const positionedCharacter = new PositionedCharacter(character, position); 
// const character2 = new Swordsman(2);
// const position2 = 2; // для поля 8x8 лучник будет находиться слева на второй строке
// const positionedCharacter2 = new PositionedCharacter(character, position); 
// const arr = [positionedCharacter, positionedCharacter2]
// Точка входа webpack
// Не пишите код в данном файле

// const character = new Character(2);

// const bow = new Bowman(2, 'hello');

// console.log(bow)
// const allowedTypes = [Bowman, Swordsman, Magician]; // доступные классы игрока
// const playerGenerator = characterGenerator(allowedTypes, 2);

// console.log(playerGenerator.next().value);
// console.log(playerGenerator.next().value);


// let r = 4;
// var character = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
// let level = Math.ceil(Math.random() * r);
// let s = new character(level)

// console.log(s)

// const characters = [new Swordsman(2), new Bowman(1)]
//  const team = new Team(characters);
 
//  console.log(team.characters) // [swordsman, bowman]


// console.log(team.characters[0].level)
// console.log(team.characters[1].level) 