import assert from "node:assert/strict";
import test from "node:test";
import { jsPDF } from "jspdf";
import { renderSchedulePdf } from "../lib/schedule-pdf.ts";

const days = Array.from({ length: 31 }, (_, index) => ({
  number: index + 1,
  weekday: "L",
  weekend: false,
}));

const shifts = [
  { id: "M", name: "Mañana", short: "M", start: "07:00", end: "15:00", color: "#f1cf6a", ink: "#4a3500" },
  { id: "L", name: "Libre", short: "L", start: "", end: "", color: "#ded9cf", ink: "#565049" },
  { id: "N", name: "Noche", short: "N", start: "23:00", end: "07:00", color: "#9db7dd", ink: "#132f59", enabled: false },
];

test("renders shift schedules in a legend below the roster", () => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const employees = Array.from({ length: 16 }, (_, index) => ({ id: `employee-${index}`, name: `Persona ${index + 1}` }));

  const pages = renderSchedulePdf(doc, {
    company: "Empresa de prueba",
    monthLabel: "agosto 2026",
    mode: "turnos",
    logo: null,
    employees,
    shifts,
    shiftSchedule: {},
    hourSchedule: {},
    days,
  });

  const pageCommands = doc.internal.pages.slice(1).map((page) => page.join("\n"));
  assert.equal(pages, 2);
  assert.equal(doc.getNumberOfPages(), 2);
  assert.ok(pageCommands.every((page) => page.includes("TURNOS Y HORARIOS")));
  assert.ok(pageCommands.every((page) => page.includes("07:00 - 15:00")));
  assert.ok(pageCommands.every((page) => page.includes("Libre")));
  assert.ok(pageCommands.every((page) => !page.includes("Noche")));
  assert.ok(pageCommands.every((page) => !page.includes("23:00 - 07:00")));
  assert.ok(pageCommands.every((page) => page.includes("cuadra.leo-dev.es")));
});

test("omits the shift legend when the roster uses free-form hours", () => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  renderSchedulePdf(doc, {
    company: "Empresa de prueba",
    monthLabel: "agosto 2026",
    mode: "horas",
    logo: null,
    employees: [{ id: "employee-1", name: "Persona 1" }],
    shifts,
    shiftSchedule: {},
    hourSchedule: { "employee-1:1": "09:00 - 17:00" },
    days,
  });

  const commands = doc.internal.pages[1].join("\n");
  assert.doesNotMatch(commands, /TURNOS Y HORARIOS/);
  assert.match(commands, /09:00 - 17:/);
});
