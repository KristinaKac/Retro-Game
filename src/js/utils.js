/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {

  if (index >= ((boardSize * boardSize) - boardSize)) {
    if (index % boardSize === 0) { return 'bottom-left' };
    if (index % boardSize === (boardSize - 1)) { return 'bottom-right' }
    return 'bottom'
  }

  if (index % boardSize === 0) {
    if (index < boardSize) { return 'top-left' }
    return 'left';
  }

  if (index < boardSize) {
    if (index === (boardSize - 1)) { return 'top-right' }
    return 'top';
  }

  if (index % boardSize === (boardSize - 1)) {
    return 'right'
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function diagonalRightLeftFirstPart(position, boardSize, move) {
  let diagonalRightLeftMove = [];

  for (let i = 0; i < boardSize; i++) {
    let arr = [];
    let column = i * boardSize;

    for (let j = 0; j + i <= column; j = j + boardSize - 1) {
      arr.push(i + j)
    }

    arr.forEach(el => {
      if (el === position) {
        diagonalRightLeftMove = arr;
      }
    });
  }
  return getAccessMove(diagonalRightLeftMove, move, position);
}

export function diagonalRightLeftSecondPart(position, boardSize, move) {
  let diagonalRightLeftMove = [];

  let column = boardSize * boardSize - boardSize;
  for (let i = boardSize - 1; i <= boardSize * boardSize - 1; i = i + boardSize) {
    let arr = [];
    for (let j = 0; j + i <= column; j = j + boardSize - 1) {
      arr.push(i + j)
    }
    column++;
    arr.forEach(el => {
      if (el === position) {
        diagonalRightLeftMove = arr;
      }
    });
  }
  return getAccessMove(diagonalRightLeftMove, move, position);
}

export function diagonalLeftRightFirstPart(position, boardSize, move) {
  let diagonalLeftRightMove = [];

  for (let i = 0; i < boardSize; i++) {
    let arr = [];
    let column = (boardSize * boardSize - 1) - (i * boardSize);
    for (let j = 0; j <= column; j = j + boardSize + 1) {
      arr.push(i + j)
    }
    arr.forEach(el => {
      if (el === position) {
        diagonalLeftRightMove = arr;
      }
    });
  }

  return getAccessMove(diagonalLeftRightMove, move, position);
}

export function diagonalLeftRightSecondPart(position, boardSize, move) {
  let diagonalLeftRightMove = [];

  for (let i = 0; i < boardSize * boardSize - boardSize; i = i + boardSize) {
    let arr = [];
    let column = ((boardSize * boardSize - 1) - i);

    for (let j = 0; j <= column; j = j + boardSize + 1) {
      arr.push(i + j)
    }
    arr.forEach(el => {
      if (el === position) {
        diagonalLeftRightMove = arr;
      }
    });
  }
  return getAccessMove(diagonalLeftRightMove, move, position);
}

export function verticalMovementAccess(position, boardSize, move) {
  const upDownMove = [];

  const column = position % boardSize;

  for (let i = 0; i < (boardSize * boardSize - 1); i++) {
    if (i % boardSize === column) {
      upDownMove.push(i);
    }
  }
  return getAccessMove(upDownMove, move, position);
}

export function horizontalMovementAccess(position, boardSize, move) {

  const horizontalMove = [];
  let minInterval = 0;
  let maxInterval = boardSize - 1;

  while (true) {
    if (position <= maxInterval && position >= minInterval) {
      break;
    }
    minInterval = minInterval + boardSize;
    maxInterval = maxInterval + boardSize;
  }
  for (let i = minInterval; i <= maxInterval; i++) {
    horizontalMove.push(i);
  }

  return getAccessMove(horizontalMove, move, position);
}

export function getAccessMove(array, move, position) {

  const moveArr = [];
  let firstMove;
  let secondMove;

  const index = array.findIndex(el => el === position);

  ((index - move) >= 0) ?
    firstMove = move : firstMove = index;

  ((index + move) <= (array.length - 1)) ?
    secondMove = move : secondMove = (array.length - 1) - index;


  for (let i = (index - firstMove); i < index; i++) {
    moveArr.push(array[i])
  }
  for (let i = index + 1; i > index && i <= (index + secondMove); i++) {
    moveArr.push(array[i])
  }
  return moveArr;
}
export function getAttackBorder(attack, arr, acc, index) {
  let move = index;
  for (let i = 1; i <= attack.attackRange; i++) {
    if (arr.includes(move)) {
      break;
    }
    move = move + acc;
  }
  return move;
}
export function availableAttack(index, attack, board) {

  const top = []; const left = []; const right = []; const bottom = [];
  let availableAttack = [];

  for (let i = 0; i < board; i++) {
    top.push(i);
    left.push(i * board);
    right.push(i * board + (board - 1))
    bottom.push(board * board - board + i);
  }

  const rightMove = getAttackBorder(attack, right, 1, index);
  const leftMove = getAttackBorder(attack, left, (-1), index);
  const upMove = getAttackBorder(attack, top, (-board), leftMove);
  let bottomMove = getAttackBorder(attack, bottom, board, leftMove);

  const lengthHorizontal = rightMove - leftMove + 1;

  for (let i = 0; i < lengthHorizontal; i++) {
    for (let j = upMove; j <= bottomMove; j = j + board) {
      availableAttack.push(i + j);
    }
    bottomMove = bottomMove + 1;
  }
  availableAttack = availableAttack.filter(el => el != index);

  return availableAttack;
}

