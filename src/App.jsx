import { useEffect, useMemo, useRef, useState } from "react";
import { createImpositionTable } from "./layout.js";
import { formatNumber } from "./numberTemplate.js";
import { validateValues } from "./formValidation.js";
import {
  createApprovalText,
  createExportFilename,
  createOnSpreadText,
} from "./export.js";

const ROW_HEIGHT = 44;
const OVERSCAN_ROWS = 8;

const initialValues = {
  start: "8400",
  end: "8500",
  positions: "6",
  template: "$$$$",
  columnName: "nomer",
};

function Field({ id, label, value, onChange, error, inputMode, hint }) {
  return (
    <div className={`field${error ? " field--invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}

function Preview({ start, end, positions, template }) {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(480);
  const total = end - start + 1;
  const rowCount = Math.ceil(total / positions);
  const firstRow = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS,
  );
  const visibleRowCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2;

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return undefined;

    const measure = () => setViewportHeight(viewport.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setScrollTop(0);
  }, [start, end, positions, template]);

  const table = useMemo(
    () => createImpositionTable(start, end, positions, {
      rowStart: firstRow,
      rowCount: visibleRowCount,
    }),
    [start, end, positions, firstRow, visibleRowCount],
  );

  const topSpacer = firstRow * ROW_HEIGHT;
  const bottomSpacer = Math.max(0, rowCount - firstRow - table.length) * ROW_HEIGHT;

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-card__heading">
        <div>
          <p className="eyebrow">Предварительный просмотр</p>
          <h2 id="preview-title">На спуск</h2>
        </div>
        <div className="count-pill" aria-live="polite">
          <span>Количество номеров —</span>
          <span className="count-pill__value">{total.toLocaleString("ru-RU")}</span>
        </div>
      </div>
      <p className="preview-card__description">
        Номера заполняют столбцы сверху вниз. Экспорт «На спуск» будет читать таблицу по строкам.
      </p>
      <div
        className="table-scroll"
        ref={scrollRef}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        role="region"
        aria-label="Предварительный просмотр раскладки номеров"
        tabIndex={0}
      >
        <table className="number-table">
          <thead>
            <tr>
              {Array.from({ length: positions }, (_, column) => (
                <th key={column} scope="col">Место {column + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topSpacer > 0 && (
              <tr className="number-table__spacer" aria-hidden="true">
                <td colSpan={positions} style={{ height: topSpacer }} />
              </tr>
            )}
            {table.map((row, rowIndex) => (
              <tr key={firstRow + rowIndex}>
                {row.map((number, column) => (
                  <td key={column}>{number === null ? "" : formatNumber(number, template)}</td>
                ))}
              </tr>
            ))}
            {bottomSpacer > 0 && (
              <tr className="number-table__spacer" aria-hidden="true">
                <td colSpan={positions} style={{ height: bottomSpacer }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="preview-card__footnote">
        Прокручивайте таблицу по вертикали или горизонтали, чтобы увидеть все позиции.
      </p>
    </section>
  );
}

export default function App() {
  const [values, setValues] = useState(initialValues);
  const validation = validateValues(values);
  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const downloadExport = (kind) => {
    if (!validation.isValid) return;

    const options = {
      start: validation.start,
      end: validation.end,
      positions: validation.positions,
      template: values.template,
      columnName: values.columnName,
    };
    const content = kind === "on-spread"
      ? createOnSpreadText(options)
      : createApprovalText(options);
    const filename = createExportFilename(kind, validation.start, validation.end);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand-mark" aria-hidden="true">№</div>
        <div>
          <p className="eyebrow">Подготовка к печати</p>
          <h1>Нумератор</h1>
        </div>
      </header>

      <div className="workspace">
        <section className="settings-card" aria-labelledby="settings-title">
          <div className="settings-card__heading">
            <p className="eyebrow">Параметры</p>
            <h2 id="settings-title">Настройте диапазон</h2>
            <p>Задайте границы нумерации и число мест на печатном листе.</p>
          </div>

          <div className="fields-grid">
            <Field
              id="start"
              label="Начальный номер"
              value={values.start}
              onChange={update("start")}
              error={validation.errors.start}
              inputMode="decimal"
            />
            <Field
              id="end"
              label="Конечный номер"
              value={values.end}
              onChange={update("end")}
              error={validation.errors.end}
              inputMode="decimal"
            />
          </div>

          <Field
            id="positions"
            label="Позиций на листе"
            value={values.positions}
            onChange={update("positions")}
            error={validation.errors.positions}
            inputMode="numeric"
            hint="Количество столбцов в раскладке."
          />

          <div className="form-divider" />

          <Field
            id="template"
            label="Шаблон номера"
            value={values.template}
            onChange={update("template")}
            error={validation.errors.template}
            hint="Символы $ задают минимальную ширину числа."
          />
          <Field
            id="columnName"
            label="Название столбца"
            value={values.columnName}
            onChange={update("columnName")}
            error={validation.errors.columnName}
          />

          {!validation.isValid && (
            <div className="validation-summary" role="alert">
              Исправьте отмеченные поля, чтобы увидеть предварительный просмотр.
            </div>
          )}
          <div className="settings-card__note">
            <span className="note-dot" aria-hidden="true" />
            <span>Предпросмотр обновляется автоматически при корректном вводе.</span>
          </div>
          <div className="export-actions" aria-label="Скачать файлы TXT">
            <button
              type="button"
              className="export-button export-button--primary"
              disabled={!validation.isValid}
              onClick={() => downloadExport("on-spread")}
            >
              на спуск
            </button>
            <button
              type="button"
              className="export-button"
              disabled={!validation.isValid}
              onClick={() => downloadExport("approval")}
            >
              согласование
            </button>
          </div>
        </section>

        <div className="preview-column">
          {validation.isValid ? (
            <Preview
              start={validation.start}
              end={validation.end}
              positions={validation.positions}
              template={values.template}
            />
          ) : (
            <section className="preview-card preview-card--empty" aria-live="polite">
              <div className="empty-state__icon" aria-hidden="true">↗</div>
              <h2>Предварительный просмотр</h2>
              <p>После исправления параметров таблица раскладки появится здесь.</p>
            </section>
          )}
        </div>
      </div>
      <footer className="page-footer">Нумерация для печатной продукции</footer>
    </main>
  );
}
