import assert from "node:assert/strict";
import test from "node:test";

import { formatNumber, validateNumberTemplate } from "../src/numberTemplate.js";

const formattingCases = [
  ["$$$$", 8400, "8400"],
  ["П$$$$$", 8400, "П08400"],
  ["П-$$$$$-А", 8400, "П-08400-А"],
  ["ABC12-$$$$-99", 8400, "ABC12-8400-99"],
  ["Заказ № $$$$ / 2026", 8400, "Заказ № 8400 / 2026"],
  ["$$$$", 7, "0007"],
  ["$$", 8400, "8400"],
  ["$$$$", -5, "-005"],
];

for (const [template, number, expected] of formattingCases) {
  test(`formats ${number} with template ${JSON.stringify(template)}`, () => {
    assert.equal(formatNumber(number, template), expected);
  });
}

test("accepts exactly one contiguous dollar group", () => {
  assert.equal(validateNumberTemplate("Заказ $$$$ 2026"), null);
});

test("rejects a template without dollar signs", () => {
  assert.match(validateNumberTemplate("Заказ 2026"), /одна непрерывная группа/);
  assert.throws(() => formatNumber(42, "Заказ 2026"), TypeError);
});

test("rejects multiple separate dollar groups", () => {
  assert.match(validateNumberTemplate("$$-$$"), /одна непрерывная группа/);
});
