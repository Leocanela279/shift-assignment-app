"use client";

import {
  ArrowDownToLine,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Eraser,
  FileText,
  ImagePlus,
  Info,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Mode = "turnos" | "horas";

type Shift = {
  id: string;
  name: string;
  short: string;
  start: string;
  end: string;
  color: string;
  ink: string;
};

type Employee = {
  id: string;
  name: string;
};

type SavedState = {
  company: string;
  month: string;
  mode: Mode;
  logo: string | null;
  employees: Employee[];
  shifts: Shift[];
  shiftSchedule: Record<string, string>;
  hourSchedule: Record<string, string>;
};

const STORAGE_KEY = "cuadra-workspace-v1";
const WEEKDAYS = ["D", "L", "M", "X", "J", "V", "S"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const defaultShifts: Shift[] = [
  { id: "M", name: "Mañana", short: "M", start: "07:00", end: "15:00", color: "#f1cf6a", ink: "#4a3500" },
  { id: "T", name: "Tarde", short: "T", start: "15:00", end: "23:00", color: "#f18b72", ink: "#5e190d" },
  { id: "N", name: "Noche", short: "N", start: "23:00", end: "07:00", color: "#9db7dd", ink: "#132f59" },
  { id: "DC", name: "Día completo", short: "DC", start: "09:00", end: "21:00", color: "#b8d8be", ink: "#183e27" },
  { id: "L", name: "Libre", short: "L", start: "", end: "", color: "#ded9cf", ink: "#565049" },
];

const defaultEmployees: Employee[] = [
  { id: "ana", name: "Ana Martín" },
  { id: "carlos", name: "Carlos Ruiz" },
  { id: "lucia", name: "Lucía Vega" },
  { id: "omar", name: "Omar Torres" },
  { id: "ines", name: "Inés Romero" },
];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function scheduleKey(employeeId: string, day: number) {
  return `${employeeId}:${day}`;
}

function createDefaultSchedule(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const total = new Date(year, monthIndex, 0).getDate();
  const values: Record<string, string> = {};
  const patterns = [
    ["M", "M", "M", "M", "M", "L", "L"],
    ["T", "T", "T", "T", "T", "L", "L"],
    ["N", "N", "L", "L", "N", "N", "N"],
    ["DC", "DC", "L", "DC", "DC", "L", "L"],
    ["L", "M", "M", "M", "M", "M", "L"],
  ];

  defaultEmployees.forEach((employee, employeeIndex) => {
    for (let day = 1; day <= total; day += 1) {
      values[scheduleKey(employee.id, day)] = patterns[employeeIndex][(day - 1) % 7];
    }
  });
  return values;
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${MONTHS[monthNumber - 1]} ${year}`;
}

export default function Home() {
  const initialMonth = currentMonth();
  const [company, setCompany] = useState("Estudio Norte");
  const [month, setMonth] = useState(initialMonth);
  const [mode, setMode] = useState<Mode>("turnos");
  const [logo, setLogo] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(defaultEmployees);
  const [shifts, setShifts] = useState<Shift[]>(defaultShifts);
  const [shiftSchedule, setShiftSchedule] = useState<Record<string, string>>(() => createDefaultSchedule(initialMonth));
  const [hourSchedule, setHourSchedule] = useState<Record<string, string>>({});
  const [selectedShift, setSelectedShift] = useState<string | null>("M");
  const [newEmployee, setNewEmployee] = useState("");
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileWeek, setMobileWeek] = useState(0);
  const painting = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    const restoreDraft = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as SavedState;
          setCompany(parsed.company);
          setMonth(parsed.month);
          setMode(parsed.mode);
          setLogo(parsed.logo);
          setEmployees(parsed.employees);
          setShifts(parsed.shifts);
          setShiftSchedule(parsed.shiftSchedule);
          setHourSchedule(parsed.hourSchedule);
        }
      } catch {
        // A damaged local draft should never prevent the editor from opening.
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(restoreDraft);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: SavedState = { company, month, mode, logo, employees, shifts, shiftSchedule, hourSchedule };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [company, employees, hourSchedule, hydrated, logo, mode, month, shiftSchedule, shifts]);

  useEffect(() => {
    const stopPainting = () => {
      painting.current = false;
    };
    window.addEventListener("pointerup", stopPainting);
    return () => window.removeEventListener("pointerup", stopPainting);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const days = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);
    const total = new Date(year, monthNumber, 0).getDate();
    return Array.from({ length: total }, (_, index) => {
      const date = new Date(year, monthNumber - 1, index + 1);
      return { number: index + 1, weekday: WEEKDAYS[date.getDay()], weekend: date.getDay() === 0 || date.getDay() === 6 };
    });
  }, [month]);

  const shiftById = useMemo(() => Object.fromEntries(shifts.map((shift) => [shift.id, shift])), [shifts]);
  const weekCount = Math.ceil(days.length / 7);
  const activeWeek = Math.min(mobileWeek, weekCount - 1);
  const mobileDays = days.slice(activeWeek * 7, activeWeek * 7 + 7);

  function changeMonth(offset: number) {
    const [year, monthNumber] = month.split("-").map(Number);
    const next = new Date(year, monthNumber - 1 + offset, 1);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
    setMobileWeek(0);
  }

  function changeMobileWeek(offset: number) {
    setMobileWeek((current) => Math.max(0, Math.min(weekCount - 1, current + offset)));
  }

  function finishWeekSwipe(clientX: number) {
    if (swipeStartX.current === null) return;
    const distance = clientX - swipeStartX.current;
    if (Math.abs(distance) > 45) changeMobileWeek(distance < 0 ? 1 : -1);
    swipeStartX.current = null;
  }

  function applyShift(employeeId: string, day: number) {
    const key = scheduleKey(employeeId, day);
    setShiftSchedule((current) => ({ ...current, [key]: selectedShift ?? "" }));
  }

  function addEmployee() {
    const name = newEmployee.trim();
    if (!name) return;
    setEmployees((current) => [...current, { id: `${Date.now()}-${name}`, name }]);
    setNewEmployee("");
    setToast(`${name} añadido al cuadrante`);
  }

  function removeEmployee(id: string) {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
  }

  function updateShift(id: string, field: keyof Shift, value: string) {
    setShifts((current) => current.map((shift) => (shift.id === id ? { ...shift, [field]: value } : shift)));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2_000_000) {
      setToast("Usa una imagen PNG o JPG de menos de 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  function resetDraft() {
    if (!window.confirm("¿Quieres borrar este borrador y volver al ejemplo inicial?")) return;
    const nextMonth = currentMonth();
    setCompany("Estudio Norte");
    setMonth(nextMonth);
    setMode("turnos");
    setLogo(null);
    setEmployees(defaultEmployees);
    setShifts(defaultShifts);
    setShiftSchedule(createDefaultSchedule(nextMonth));
    setHourSchedule({});
    setSelectedShift("M");
    setToast("Borrador reiniciado");
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = 297;
      const margin = 10;
      const nameWidth = 38;
      const dayWidth = (pageWidth - margin * 2 - nameWidth) / days.length;
      const rowHeight = 8.5;
      const pageSize = 16;
      const pages = Math.max(1, Math.ceil(employees.length / pageSize));

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
        doc.text(`Cuadrante de ${getMonthLabel(month)}`, titleX, 20);

        doc.setFontSize(7.5);
        let legendX = pageWidth - margin;
        [...shifts].reverse().forEach((shift) => {
          const label = `${shift.short} ${shift.name}`;
          const width = doc.getTextWidth(label) + 8;
          legendX -= width;
          doc.setFillColor(shift.color);
          doc.roundedRect(legendX, 10, 4, 4, 1, 1, "F");
          doc.setTextColor(23, 34, 56);
          doc.text(label, legendX + 6, 13.4);
        });

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

        doc.setFont("helvetica", "normal");
        doc.setTextColor(90, 86, 80);
        doc.setFontSize(6.5);
        doc.text("Creado gratis con Cuadra · cuadra.app", margin, 202);
        if (pages > 1) doc.text(`${page + 1} / ${pages}`, pageWidth - margin, 202, { align: "right" });
      }

      const safeName = (company || "cuadrante").toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-").replace(/^-|-$/g, "");
      doc.save(`${safeName}-${month}.pdf`);
      setToast("PDF descargado");
    } catch {
      setToast("No hemos podido generar el PDF. Inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  const filledCells = mode === "turnos"
    ? Object.values(shiftSchedule).filter(Boolean).length
    : Object.values(hourSchedule).filter(Boolean).length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#editor" aria-label="Cuadra, ir al editor">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>CUADRA</span>
          <em>beta</em>
        </a>
        <div className="topbar-copy">
          <span className="status-dot" />
          Tu borrador se guarda solo en este dispositivo
        </div>
        <nav className="topbar-actions" aria-label="Acciones del proyecto">
          <a href="https://github.com/Leocanela279/shift-assignment-app" target="_blank" rel="noreferrer" className="ghost-button"><Code2 size={17} /> Código abierto</a>
          <button className="export-button" onClick={exportPdf} disabled={exporting}>
            {exporting ? <span className="spinner" /> : <ArrowDownToLine size={18} />}
            {exporting ? "Preparando…" : "Descargar PDF"}
          </button>
        </nav>
      </header>

      <section className="intro-band">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> SIN REGISTRO · GRATIS · OPEN SOURCE</p>
          <h1>Tu equipo, <span>bien cuadrado.</span></h1>
        </div>
        <p>Configura, reparte turnos y llévate un PDF listo para imprimir. Sin cuentas, sin plantillas eternas.</p>
      </section>

      <section className="workspace" id="editor">
        <aside className={`control-panel ${settingsOpen ? "expanded" : "collapsed"}`}>
          <div className="panel-heading">
            <div>
              <span>PASO 1</span>
              <h2>Prepara el cuadrante</h2>
            </div>
            <button className="mobile-settings-toggle" onClick={() => setSettingsOpen((current) => !current)} aria-expanded={settingsOpen} aria-controls="schedule-settings">
              <span>{settingsOpen ? "Cerrar" : "Editar datos"}</span>
              <ChevronRight size={19} />
            </button>
            <Settings2 className="desktop-settings-icon" size={21} />
          </div>

          <div className="control-content" id="schedule-settings">
          <div className="field-group">
            <label htmlFor="company">Nombre de la empresa</label>
            <input id="company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Mi empresa" />
          </div>

          <div className="field-group">
            <span className="field-label">Logo <small>opcional</small></span>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} hidden />
            {logo ? (
              <div className="logo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="Logo de la empresa" />
                <button onClick={() => setLogo(null)} aria-label="Quitar logo"><X size={16} /></button>
              </div>
            ) : (
              <button className="upload-button" onClick={() => fileInput.current?.click()}><ImagePlus size={19} /> Subir logo <small>PNG o JPG</small></button>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="month">Mes del cuadrante</label>
            <div className="month-control">
              <button onClick={() => changeMonth(-1)} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
              <input id="month" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setMobileWeek(0); }} />
              <button onClick={() => changeMonth(1)} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="field-group mode-group">
            <span className="field-label">¿Cómo quieres rellenarlo?</span>
            <div className="mode-switch" role="tablist" aria-label="Formato del cuadrante">
              <button className={mode === "turnos" ? "active" : ""} onClick={() => setMode("turnos")} role="tab" aria-selected={mode === "turnos"}>
                <CalendarDays size={17} /> Por turnos
              </button>
              <button className={mode === "horas" ? "active" : ""} onClick={() => setMode("horas")} role="tab" aria-selected={mode === "horas"}>
                <Clock3 size={17} /> Por horas
              </button>
            </div>
            <p>{mode === "turnos" ? "Elige una sigla y pinta las casillas del calendario." : "Escribe un horario distinto en cada casilla, por ejemplo 9–17."}</p>
          </div>

          {mode === "turnos" && (
            <div className="field-group shifts-editor">
              <span className="field-label">Define tus turnos</span>
              <div className="shift-list">
                {shifts.map((shift) => (
                  <div className="shift-row" key={shift.id}>
                    <span className="shift-color" style={{ background: shift.color }} />
                    <input className="shift-short-input" value={shift.short} maxLength={3} onChange={(event) => updateShift(shift.id, "short", event.target.value.toUpperCase())} aria-label={`Sigla de ${shift.name}`} />
                    <input className="shift-name-input" value={shift.name} onChange={(event) => updateShift(shift.id, "name", event.target.value)} aria-label="Nombre del turno" />
                    {shift.id !== "L" && (
                      <div className="shift-time">
                        <input type="time" value={shift.start} onChange={(event) => updateShift(shift.id, "start", event.target.value)} aria-label={`Inicio de ${shift.name}`} />
                        <span>—</span>
                        <input type="time" value={shift.end} onChange={(event) => updateShift(shift.id, "end", event.target.value)} aria-label={`Fin de ${shift.name}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="field-group team-editor">
            <div className="field-label-row">
              <span className="field-label">Equipo</span>
              <span>{employees.length} personas</span>
            </div>
            <div className="employee-list">
              {employees.map((employee) => (
                <div className="employee-item" key={employee.id}>
                  <span>{employee.name.slice(0, 1).toUpperCase()}</span>
                  <input value={employee.name} onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, name: event.target.value } : item))} aria-label="Nombre del empleado" />
                  <button onClick={() => removeEmployee(employee.id)} aria-label={`Eliminar a ${employee.name}`}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <div className="add-employee">
              <input value={newEmployee} onChange={(event) => setNewEmployee(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addEmployee()} placeholder="Nombre y apellidos" aria-label="Nueva persona" />
              <button onClick={addEmployee} aria-label="Añadir persona"><Plus size={18} /></button>
            </div>
          </div>

          <button className="reset-button" onClick={resetDraft}><RotateCcw size={15} /> Reiniciar ejemplo</button>
          </div>
        </aside>

        <div className="schedule-area">
          <div className="schedule-toolbar">
            <div className="schedule-title">
              <span>PASO 2</span>
              <div>
                <h2>{company || "Mi empresa"}</h2>
                <p>Cuadrante de {getMonthLabel(month)}</p>
              </div>
            </div>
            <div className="schedule-stats">
              <span><Users size={16} /> {employees.length} personas</span>
              <span><Check size={16} /> {filledCells} casillas</span>
            </div>
          </div>

          {mode === "turnos" && (
            <div className="paint-palette" aria-label="Selector de turno">
              <span>Selecciona y pinta:</span>
              {shifts.map((shift) => (
                <button
                  key={shift.id}
                  className={selectedShift === shift.id ? "selected" : ""}
                  onClick={() => setSelectedShift(shift.id)}
                  style={{ "--shift-color": shift.color, "--shift-ink": shift.ink } as React.CSSProperties}
                >
                  <b>{shift.short}</b>
                  <span>{shift.name}</span>
                  {selectedShift === shift.id && <Check size={14} />}
                </button>
              ))}
              <button className={`eraser ${selectedShift === null ? "selected" : ""}`} onClick={() => setSelectedShift(null)}><Eraser size={15} /> Borrar</button>
            </div>
          )}

          <div className="schedule-card">
            <div className="table-scroll">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th className="employee-heading">PERSONA</th>
                    {days.map((day) => <th key={day.number} className={day.weekend ? "weekend" : ""}><b>{day.number}</b><span>{day.weekday}</span></th>)}
                    <th className="total-heading">DÍAS</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => {
                    const total = days.filter((day) => {
                      const value = mode === "turnos" ? shiftSchedule[scheduleKey(employee.id, day.number)] : hourSchedule[scheduleKey(employee.id, day.number)];
                      return value && value !== "L";
                    }).length;
                    return (
                      <tr key={employee.id}>
                        <th scope="row" className="employee-cell"><span>{employee.name.slice(0, 1).toUpperCase()}</span><b>{employee.name || "Sin nombre"}</b></th>
                        {days.map((day) => {
                          const key = scheduleKey(employee.id, day.number);
                          const shift = shiftById[shiftSchedule[key]];
                          return (
                            <td key={day.number} className={day.weekend ? "weekend" : ""}>
                              {mode === "turnos" ? (
                                <button
                                  className="shift-cell"
                                  style={shift ? { background: shift.color, color: shift.ink } : undefined}
                                  onPointerDown={(event) => { event.preventDefault(); painting.current = true; applyShift(employee.id, day.number); }}
                                  onPointerEnter={() => { if (painting.current) applyShift(employee.id, day.number); }}
                                  aria-label={`${employee.name}, día ${day.number}: ${shift?.name ?? "vacío"}`}
                                  title={`${employee.name} · ${day.number} de ${getMonthLabel(month)}`}
                                >{shift?.short}</button>
                              ) : (
                                <input
                                  className="hour-cell"
                                  value={hourSchedule[key] ?? ""}
                                  onChange={(event) => setHourSchedule((current) => ({ ...current, [key]: event.target.value }))}
                                  placeholder="—"
                                  aria-label={`Horario de ${employee.name}, día ${day.number}`}
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className="total-cell">{total}</td>
                      </tr>
                    );
                  })}
                  {employees.length === 0 && (
                    <tr><td className="empty-team" colSpan={days.length + 2}><Users size={25} /><b>Tu cuadrante está esperando al equipo</b><span>Añade la primera persona desde el panel.</span></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="mobile-schedule"
              onTouchStart={(event) => { swipeStartX.current = event.changedTouches[0].clientX; }}
              onTouchEnd={(event) => finishWeekSwipe(event.changedTouches[0].clientX)}
            >
              <div className="mobile-week-nav">
                <button onClick={() => changeMobileWeek(-1)} disabled={activeWeek === 0} aria-label="Semana anterior"><ChevronLeft size={20} /></button>
                <div>
                  <b>Semana {activeWeek + 1} de {weekCount}</b>
                  <span>{mobileDays[0]?.number}–{mobileDays[mobileDays.length - 1]?.number} de {getMonthLabel(month)}</span>
                </div>
                <button onClick={() => changeMobileWeek(1)} disabled={activeWeek === weekCount - 1} aria-label="Semana siguiente"><ChevronRight size={20} /></button>
              </div>

              <div className="mobile-days-heading" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => mobileDays[index] ?? null).map((day, index) => (
                  day ? <div className={day.weekend ? "weekend" : ""} key={day.number}><span>{day.weekday}</span><b>{day.number}</b></div> : <div className="blank" key={`blank-${index}`} />
                ))}
              </div>

              <div className="mobile-employee-list">
                {employees.map((employee) => {
                  const total = days.filter((day) => {
                    const value = mode === "turnos" ? shiftSchedule[scheduleKey(employee.id, day.number)] : hourSchedule[scheduleKey(employee.id, day.number)];
                    return value && value !== "L";
                  }).length;
                  return (
                    <article className="mobile-employee-card" key={employee.id}>
                      <header>
                        <div><span>{employee.name.slice(0, 1).toUpperCase()}</span><b>{employee.name || "Sin nombre"}</b></div>
                        <small>{total} días</small>
                      </header>
                      <div className="mobile-cells">
                        {Array.from({ length: 7 }, (_, index) => mobileDays[index] ?? null).map((day, index) => {
                          if (!day) return <div className="mobile-empty-cell" key={`blank-${index}`} />;
                          const key = scheduleKey(employee.id, day.number);
                          const shift = shiftById[shiftSchedule[key]];
                          return mode === "turnos" ? (
                            <button
                              key={day.number}
                              className={`mobile-shift-cell ${day.weekend ? "weekend" : ""}`}
                              style={shift ? { background: shift.color, color: shift.ink } : undefined}
                              onClick={() => applyShift(employee.id, day.number)}
                              aria-label={`${employee.name}, día ${day.number}: ${shift?.name ?? "vacío"}`}
                            >{shift?.short || <span>+</span>}</button>
                          ) : (
                            <input
                              key={day.number}
                              className={`mobile-hour-cell ${day.weekend ? "weekend" : ""}`}
                              value={hourSchedule[key] ?? ""}
                              onChange={(event) => setHourSchedule((current) => ({ ...current, [key]: event.target.value }))}
                              placeholder="—"
                              aria-label={`Horario de ${employee.name}, día ${day.number}`}
                            />
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
                {employees.length === 0 && <div className="mobile-empty-team"><Users size={24} /><b>Añade una persona para empezar</b></div>}
              </div>
              <p className="swipe-hint"><ChevronLeft size={13} /> Desliza para cambiar de semana <ChevronRight size={13} /></p>
            </div>

            <div className="schedule-footnote"><Info size={15} /> <span className="desktop-hint">{mode === "turnos" ? "Puedes mantener pulsado y arrastrar para pintar varias casillas." : "Consejo: usa formatos cortos como 9–17 o 10:30–18:30."}</span><span className="mobile-hint">{mode === "turnos" ? "Selecciona un turno arriba y toca las casillas para aplicarlo." : "Usa formatos cortos como 9–17 para que se lean mejor."}</span></div>
          </div>

          <div className="final-action">
            <div><FileText size={24} /><p><b>¿Todo listo?</b><span>El PDF se crea en tu navegador. Tus datos no salen de aquí.</span></p></div>
            <button onClick={exportPdf} disabled={exporting}>{exporting ? <span className="spinner dark" /> : <ArrowDownToLine size={19} />}{exporting ? "Creando PDF…" : "Descargar cuadrante"}</button>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#editor"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>CUADRA</span></a>
        <p>Cuadrantes claros para equipos reales.</p>
        <span>Hecho para compartir · 100% gratuito</span>
      </footer>

      {toast && <div className="toast" role="status"><Check size={17} /> {toast}</div>}
    </main>
  );
}
