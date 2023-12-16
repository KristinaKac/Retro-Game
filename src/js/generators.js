import Team from "./Team";
import PositionedCharacter from "./PositionedCharacter";

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomCharacter = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    let level = Math.ceil(Math.random() * maxLevel);
    let character = new randomCharacter(level);
    yield character;
  }
}




/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount, addArr) {
  const arr = [];

  const playerGenerator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i++) {
    arr.push(playerGenerator.next().value);
  }
  if(addArr){
    addArr.forEach(el => {
      arr.push(el);
    });
  }
  return new Team(arr);
}

export function randomInitPositions(team, initPositions) {
  let positions = new Set();
  const teamPositions = [];

  while (positions.size < team.characters.length) {
    positions.add(initPositions[Math.floor(Math.random() * initPositions.length)]);
  }
  let arr = Array.from(positions);
  for (let i = 0; i < team.characters.length; i++) {
    teamPositions.push(new PositionedCharacter(team.characters[i], arr[i]));
  }
  return teamPositions;
}
