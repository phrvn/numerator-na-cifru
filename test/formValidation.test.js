import assert from "node:assert/strict";
import test from "node:test";

import { validateValues } from "../src/formValidation.js";

const validValues = {
  start: "1",
  end: "7",
  positions: "3",
  template: "$$$$",
  columnName: "Номер",
};

test("valid export inputs pass form validation", () => {
  assert.equal(validateValues(validValues).isValid, true);
});

test("invalid export inputs fail validation and disable export controls", () => {
  for (const change of [
    { end: "0" },
    { positions: "0" },
    { template: "$$-$$" },
    { columnName: "   " },
  ]) {
    const validation = validateValues({ ...validValues, ...change });
    assert.equal(validation.isValid, false);
    assert.ok(Object.keys(validation.errors).length > 0);
  }
});
