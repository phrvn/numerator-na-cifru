import assert from "node:assert/strict";
import test from "node:test";

import {
  createApprovalText,
  createExportFilename,
  createOnSpreadText,
} from "../src/export.js";

function readExportNumbers(content) {
  const lines = content.split("\n");
  return { header: lines[0], values: lines.slice(1) };
}

function assertContainsRangeExactlyOnce(values, start, end) {
  const numbers = values.map(Number);
  const expected = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  assert.equal(numbers.length, expected.length);
  assert.equal(new Set(numbers).size, expected.length);
  assert.deepEqual(numbers.toSorted((a, b) => a - b), expected);
  assert.ok(numbers.every((number) => number >= start && number <= end));
}

test("on-spread export follows rows and skips the incomplete final column", () => {
  const content = createOnSpreadText({
    start: 1,
    end: 7,
    positions: 3,
    template: "$$$$",
    columnName: "  Номер заказа  ",
  });
  const { header, values } = readExportNumbers(content);

  assert.equal(header, "  Номер заказа  ");
  assert.deepEqual(values, ["0001", "0004", "0007", "0002", "0005", "0003", "0006"]);
  assertContainsRangeExactlyOnce(values, 1, 7);
  assert.ok(!content.endsWith("\n"));
  assert.ok(!content.split("\n").includes(""));
});

test("on-spread export reads an eight-number layout row by row", () => {
  const { values } = readExportNumbers(createOnSpreadText({
    start: 1,
    end: 8,
    positions: 3,
    template: "$$",
    columnName: "Номер",
  }));

  assert.deepEqual(values, ["01", "04", "07", "02", "05", "08", "03", "06"]);
  assertContainsRangeExactlyOnce(values, 1, 8);
});

test("on-spread export handles a one-number range and custom formatting", () => {
  const content = createOnSpreadText({
    start: 5,
    end: 5,
    positions: 3,
    template: "№ $$$ / А",
    columnName: "Заказ",
  });
  const { header, values } = readExportNumbers(content);

  assert.equal(header, "Заказ");
  assert.deepEqual(values, ["№ 005 / А"]);
  assert.equal(content, "Заказ\n№ 005 / А");
  assertContainsRangeExactlyOnce(values.map((value) => value.match(/\d+/)[0]), 5, 5);
});

test("approval export is ascending and includes both endpoints", () => {
  const content = createApprovalText({
    start: 8400,
    end: 8500,
    positions: 6,
    template: "П$$$$$-А",
    columnName: "Утверждение",
  });
  const { header, values } = readExportNumbers(content);

  assert.equal(header, "Утверждение");
  assert.equal(values.length, 101);
  assert.equal(values[0], "П08400-А");
  assert.equal(values.at(-1), "П08500-А");
  assertContainsRangeExactlyOnce(values.map((value) => value.match(/\d+/)[0]), 8400, 8500);
  assert.ok(!content.endsWith("\n"));
  assert.ok(!content.split("\n").includes(""));
});

test("approval export supports one number", () => {
  assert.equal(createApprovalText({
    start: 5,
    end: 5,
    positions: 3,
    template: "$$$$",
    columnName: "N",
  }), "N\n0005");
});

test("export filenames use the required names and inclusive bounds", () => {
  assert.equal(createExportFilename("on-spread", 1, 7), "наспуск_1—7.txt");
  assert.equal(createExportFilename("approval", 8400, 8500), "согласование_8400—8500.txt");
  assert.equal(createExportFilename("on-spread", -5, -1), "наспуск_-5—-1.txt");
});

test("exports reject invalid ranges and formatting", () => {
  assert.throws(() => createApprovalText({
    start: 2, end: 1, positions: 3, template: "$$", columnName: "N",
  }), RangeError);
  assert.throws(() => createOnSpreadText({
    start: 1, end: 2, positions: 3, template: "$$-$$", columnName: "N",
  }), TypeError);
});
