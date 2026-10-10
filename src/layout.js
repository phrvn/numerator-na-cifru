export function createImpositionTable(
  start,
  end,
  positions,
  { rowStart = 0, rowCount } = {},
) {
  if (!Number.isSafeInteger(start)) {
    throw new TypeError("Start must be a safely representable integer.");
  }

  if (!Number.isSafeInteger(end)) {
    throw new TypeError("End must be a safely representable integer.");
  }

  if (start > end) {
    throw new RangeError("Start must be less than or equal to end.");
  }

  if (!Number.isSafeInteger(positions) || positions <= 0) {
    throw new RangeError("Positions must be a positive integer.");
  }

  const total = end - start + 1;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError("The range is too large for exact JavaScript integer arithmetic.");
  }

  const columnHeight = Math.ceil(total / positions);
  if (!Number.isSafeInteger(rowStart) || rowStart < 0) {
    throw new RangeError("Row start must be a non-negative integer.");
  }

  const visibleRowCount = rowCount ?? columnHeight;
  if (!Number.isSafeInteger(visibleRowCount) || visibleRowCount < 0) {
    throw new RangeError("Row count must be a non-negative integer.");
  }

  const firstVisibleRow = Math.min(rowStart, columnHeight);
  const lastVisibleRow = firstVisibleRow + Math.min(
    visibleRowCount,
    columnHeight - firstVisibleRow,
  );
  const table = Array.from(
    { length: lastVisibleRow - firstVisibleRow },
    () => Array(positions).fill(null),
  );

  for (let column = 0; column < positions; column += 1) {
    const firstNumber = start + column * columnHeight;

    for (let row = firstVisibleRow; row < lastVisibleRow; row += 1) {
      const number = firstNumber + row;

      if (number > end) {
        break;
      }

      table[row - firstVisibleRow][column] = number;
    }
  }

  return table;
}
