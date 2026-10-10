import { createImpositionTable } from "./layout.js";
import { formatNumber, validateNumberTemplate } from "./numberTemplate.js";

const EXPORT_ROW_CHUNK_SIZE = 512;

function validateExportOptions({ start, end, positions, template, columnName }) {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    throw new RangeError("Export range must contain safely representable integers.");
  }

  if (!Number.isSafeInteger(end - start + 1)) {
    throw new RangeError("Export range is too large for exact integer arithmetic.");
  }

  if (!Number.isSafeInteger(positions) || positions <= 0) {
    throw new RangeError("Positions must be a positive integer.");
  }

  const templateError = validateNumberTemplate(template);
  if (templateError) throw new TypeError(templateError);
  if (typeof columnName !== "string" || !columnName.trim()) {
    throw new TypeError("Column name must not be blank.");
  }
}

export function createOnSpreadText(options) {
  validateExportOptions(options);
  const { start, end, positions, template, columnName } = options;
  const total = end - start + 1;
  const height = Math.ceil(total / positions);
  const formattedNumbers = [];

  for (let rowStart = 0; rowStart < height; rowStart += EXPORT_ROW_CHUNK_SIZE) {
    const tableRows = createImpositionTable(start, end, positions, {
      rowStart,
      rowCount: Math.min(EXPORT_ROW_CHUNK_SIZE, height - rowStart),
    });

    for (const row of tableRows) {
      for (const number of row) {
        if (number !== null) formattedNumbers.push(formatNumber(number, template));
      }
    }
  }

  return `${columnName}\n${formattedNumbers.join("\n")}`;
}

export function createApprovalText(options) {
  validateExportOptions(options);
  const { start, end, template, columnName } = options;
  const total = end - start + 1;
  const formattedNumbers = new Array(total);

  for (let offset = 0; offset < total; offset += 1) {
    formattedNumbers[offset] = formatNumber(start + offset, template);
  }

  return `${columnName}\n${formattedNumbers.join("\n")}`;
}

export function createExportFilename(kind, start, end) {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    throw new RangeError("Export filename range is invalid.");
  }

  const prefix = kind === "on-spread"
    ? "наспуск"
    : kind === "approval"
      ? "согласование"
      : null;
  if (!prefix) throw new TypeError("Unknown export type.");

  return `${prefix}_${start}—${end}.txt`;
}
