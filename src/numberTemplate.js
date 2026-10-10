const NUMBER_GROUP_PATTERN = /\$+/g;

export function validateNumberTemplate(template) {
  if (typeof template !== "string") {
    return "Шаблон должен быть текстом.";
  }

  const groups = [...template.matchAll(NUMBER_GROUP_PATTERN)];
  if (groups.length !== 1) {
    return "В шаблоне должна быть одна непрерывная группа символов $.";
  }

  return null;
}

export function formatNumber(number, template) {
  const templateError = validateNumberTemplate(template);
  if (templateError) {
    throw new TypeError(templateError);
  }

  if (!Number.isSafeInteger(number)) {
    throw new TypeError("Номер должен быть безопасно представимым целым числом.");
  }

  const [group] = [...template.matchAll(NUMBER_GROUP_PATTERN)];
  const sign = number < 0 ? "-" : "";
  const digits = String(Math.abs(number));
  const paddedDigits = digits.padStart(Math.max(group[0].length - sign.length, 0), "0");
  const formatted = `${sign}${paddedDigits}`;

  return `${template.slice(0, group.index)}${formatted}${template.slice(group.index + group[0].length)}`;
}
