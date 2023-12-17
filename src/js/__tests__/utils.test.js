import { calcTileType, availableAttack } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [2, 8, 'top'],
  [63, 8, 'bottom-right'],
  [7, 7, 'left'],
  [15, 8, 'right'],
  [7, 8, 'top-right'],
  [60, 8, 'bottom'],
  [56, 8, 'bottom-left'],
  [0, 4, 'top-left'],
  [2, 4, 'top'],
  [15, 4, 'bottom-right'],
  [8, 4, 'left'],
  [11, 4, 'right'],
  [3, 4, 'top-right'],
])('testing calcTileType: index %i, boardSize %i, result %s', (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(expected);
});

test.each([
  [2, {
    name: 'bowman', type: 'player', move: 2, attackRange: 3,
  }, 8, 23],
  [17, {
    name: 'bowman', type: 'player', move: 2, attackRange: 2,
  }, 8, 19],
  [44, {
    name: 'magician', type: 'player', move: 1, attackRange: 4,
  }, 8, 55],
  [58, {
    name: 'swordsman', type: 'player', move: 4, attackRange: 1,
  }, 8, 5],
])('number of possible attack received: index %i, attack %i, boardSize %s', (index, attack, board, expected) => {
  const result = availableAttack(index, attack, board);
  const set = new Set(result);
  expect(set.size).toBe(expected);
});
