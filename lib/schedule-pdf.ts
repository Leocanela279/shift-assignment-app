import type { jsPDF } from "jspdf";

export type PdfMode = "turnos" | "horas";

export type PdfShift = {
  id: string;
  name: string;
  short: string;
  start: string;
  end: string;
  color: string;
  ink: string;
  enabled?: boolean;
};

type PdfEmployee = {
  id: string;
  name: string;
};

type PdfDay = {
  number: number;
  weekday: string;
  weekend: boolean;
};

type SchedulePdfOptions = {
  company: string;
  monthLabel: string;
  mode: PdfMode;
  logo: string | null;
  employees: PdfEmployee[];
  shifts: PdfShift[];
  shiftSchedule: Record<string, string>;
  hourSchedule: Record<string, string>;
  days: PdfDay[];
};

function scheduleKey(employeeId: string, day: number) {
  return `${employeeId}:${day}`;
}

function legendSchedule(shift: PdfShift) {
  if (!shift.start || !shift.end) return "";
  return ` · ${shift.start} - ${shift.end}`;
}

export function renderSchedulePdf(doc: jsPDF, options: SchedulePdfOptions) {
  const {
    company,
    monthLabel,
    mode,
    logo,
    employees,
    shifts,
    shiftSchedule,
    hourSchedule,
    days,
  } = options;
  const pageWidth = 297;
  const margin = 10;
  const nameWidth = 38;
  const dayWidth = (pageWidth - margin * 2 - nameWidth) / days.length;
  const rowHeight = 8.5;
  const pageSize = mode === "turnos" ? 15 : 16;
  const pages = Math.max(1, Math.ceil(employees.length / pageSize));
  const activeShifts = shifts.filter((shift) => shift.enabled !== false);
  const shiftById = Object.fromEntries(activeShifts.map((shift) => [shift.id, shift]));

  for (let page = 0; page < pages; page += 1) {
    if (page > 0) doc.addPage();
    doc.setFillColor(244, 239, 229);
    doc.rect(0, 0, 297, 210, "F");
    doc.setFillColor(240, 90, 71);
    doc.rect(0, 0, 5, 210, "F");

    let titleX = margin;
    if (logo) {
      try {
        const format = logo.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(logo, format, margin, 8, 15, 15, undefined, "FAST");
        titleX = margin + 19;
      } catch {
        titleX = margin;
      }
    }
    doc.setTextColor(23, 34, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(company || "Mi empresa", titleX, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cuadrante de ${monthLabel}`, titleX, 20);

    const top = 31;
    doc.setFillColor(23, 34, 56);
    doc.rect(margin, top, nameWidth, 11, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("EQUIPO", margin + 3, top + 7);

    days.forEach((day, index) => {
      const x = margin + nameWidth + index * dayWidth;
      if (day.weekend) doc.setFillColor(240, 90, 71);
      else doc.setFillColor(23, 34, 56);
      doc.rect(x, top, dayWidth, 11, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text(String(day.number), x + dayWidth / 2, top + 4.5, { align: "center" });
      doc.setFontSize(5);
      doc.text(day.weekday, x + dayWidth / 2, top + 8.5, { align: "center" });
    });

    const pageEmployees = employees.slice(page * pageSize, (page + 1) * pageSize);
    pageEmployees.forEach((employee, rowIndex) => {
      const y = top + 11 + rowIndex * rowHeight;
      doc.setDrawColor(202, 195, 183);
      doc.setFillColor(rowIndex % 2 === 0 ? 255 : 249, rowIndex % 2 === 0 ? 253 : 247, rowIndex % 2 === 0 ? 249 : 242);
      doc.rect(margin, y, nameWidth, rowHeight, "FD");
      doc.setTextColor(23, 34, 56);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(employee.name.slice(0, 22), margin + 3, y + 5.5);

      days.forEach((day, dayIndex) => {
        const key = scheduleKey(employee.id, day.number);
        const x = margin + nameWidth + dayIndex * dayWidth;
        const value = mode === "turnos" ? shiftSchedule[key] : hourSchedule[key];
        const shift = shiftById[value];
        if (mode === "turnos" && shift) doc.setFillColor(shift.color);
        else if (day.weekend) doc.setFillColor(238, 233, 224);
        else doc.setFillColor(255, 253, 249);
        doc.rect(x, y, dayWidth, rowHeight, "FD");
        doc.setTextColor(23, 34, 56);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(mode === "turnos" ? 6.5 : 4.4);
        const printable = mode === "turnos" ? shift?.short ?? "" : value ?? "";
        doc.text(printable.slice(0, 11), x + dayWidth / 2, y + 5.4, { align: "center" });
      });
    });

    if (mode === "turnos") {
      const tableBottom = top + 11 + pageEmployees.length * rowHeight;
      const legendTop = tableBottom + 5;
      const legendColumnWidth = (pageWidth - margin * 2) / 3;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(90, 86, 80);
      doc.text("TURNOS Y HORARIOS", margin, legendTop);

      activeShifts.forEach((shift, index) => {
        const column = index % 3;
        const row = Math.floor(index / 3);
        const x = margin + column * legendColumnWidth;
        const y = legendTop + 6 + row * 7.5;
        const name = shift.name.trim().slice(0, 26) || "Turno";
        const label = `${shift.short || shift.id} · ${name}${legendSchedule(shift)}`;

        doc.setFillColor(shift.color);
        doc.roundedRect(x, y - 3.6, 4.5, 4.5, 1, 1, "F");
        doc.setTextColor(23, 34, 56);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.text(label, x + 7, y);
      });
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 86, 80);
    doc.setFontSize(6.5);
    doc.text("Creado gratis con Cuadra · cuadra.leo-dev.es", margin, 204);
    if (pages > 1) doc.text(`${page + 1} / ${pages}`, pageWidth - margin, 204, { align: "right" });
  }

  return pages;
}
