import { validateNumberTemplate } from "./numberTemplate.js";

function parseIntegerField(value, label) {
  if (!/^-?\d+$/.test(value)) {
    return { error: `${label}: введите целое число.` };
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    return {
      error: `${label}: число выходит за пределы точных целых чисел JavaScript.`,
    };
  }

  return { value: number };
}

export function validateValues(values) {
  const errors = {};
  const startResult = parseIntegerField(values.start, "Начальный номер");
  const endResult = parseIntegerField(values.end, "Конечный номер");
  const positionsResult = parseIntegerField(values.positions, "Количество позиций");

  if (startResult.error) errors.start = startResult.error;
  if (endResult.error) errors.end = endResult.error;
  if (positionsResult.error) errors.positions = positionsResult.error;

  if (positionsResult.value !== undefined && positionsResult.value <= 0) {
    errors.positions = "Количество позиций должно быть больше нуля.";
  }

  if (startResult.value !== undefined && endResult.value !== undefined) {
    if (startResult.value > endResult.value) {
      errors.end = "Конечный номер не может быть меньше начального.";
    } else if (!Number.isSafeInteger(endResult.value - startResult.value + 1)) {
      errors.end = "Диапазон слишком велик для точного подсчёта в JavaScript.";
    }
  }

  const templateError = validateNumberTemplate(values.template);
  if (templateError) errors.template = templateError;

  if (!values.columnName.trim()) {
    errors.columnName = "Название столбца не должно быть пустым.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    start: startResult.value,
    end: endResult.value,
    positions: positionsResult.value,
  };
}
