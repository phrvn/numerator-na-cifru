import assert from "node:assert/strict";
import test from "node:test";

import { createImpositionTable } from "../src/layout.js";

const cases = [
  {
    name: "S=1, E=7, N=3",
    start: 1,
    end: 7,
    positions: 3,
    expected: [
      [1, 4, 7],
      [2, 5, null],
      [3, 6, null],
    ],
  },
  {
    name: "S=1, E=8, N=3",
    start: 1,
    end: 8,
    positions: 3,
    expected: [
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, null],
    ],
  },
  {
    name: "S=5, E=5, N=3",
    start: 5,
    end: 5,
    positions: 3,
    expected: [[5, null, null]],
  },
  {
    name: "S=1, E=3, N=5",
    start: 1,
    end: 3,
    positions: 5,
    expected: [[1, 2, 3, null, null]],
  },
  {
    name: "S=1, E=9, N=3",
    start: 1,
    end: 9,
    positions: 3,
    expected: [
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ],
  },
  {
    name: "S=8400, E=8500, N=6",
    start: 8400,
    end: 8500,
    positions: 6,
    expected: Array.from({ length: 17 }, (_, row) =>
      Array.from({ length: 6 }, (_, column) => {
        const number = 8400 + column * 17 + row;
        return number <= 8500 ? number : null;
      }),
    ),
  },
];

for (const { name, start, end, positions, expected } of cases) {
  test(`creates the expected table for ${name}`, () => {
    const table = createImpositionTable(start, end, positions);

    assert.deepEqual(table, expected);

    const values = table.flat().filter((value) => value !== null);
    const expectedValues = Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    );

    assert.equal(values.length, end - start + 1);
    assert.equal(new Set(values).size, end - start + 1);
    assert.deepEqual(
      values.toSorted((left, right) => left - right),
      expectedValues,
    );
    assert.ok(values.every((value) => value >= start && value <= end));
  });
}

test("rejects invalid input", () => {
  assert.throws(() => createImpositionTable(2, 1, 3), RangeError);
  assert.throws(() => createImpositionTable(1, 3, 0), RangeError);
  assert.throws(() => createImpositionTable(1.5, 3, 2), TypeError);
  assert.throws(
    () => createImpositionTable(0, Number.MAX_SAFE_INTEGER + 1, 1),
    TypeError,
  );
  assert.throws(
    () => createImpositionTable(-4503599627370496, 4503599627370495, 1),
    RangeError,
  );
});

test("creates only the requested rows for a long preview", () => {
  assert.deepEqual(createImpositionTable(1, 10, 3, { rowStart: 2, rowCount: 1 }), [
    [3, 7, null],
  ]);
});
