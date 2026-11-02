// Kichi Vietnamese Foodtour: một quán.

import type { Employee, Schedule } from "../types";
import { type WeekdayKey } from "./demand";
import { type DemandBand, type StaffingRule } from "./staffing";
import { DEFAULT_WORK_HOURS } from "./workHours";
import { kichiEmployees } from "./restaurantData";
import { clip } from "./staffing";
import type { WorkHoursConfig } from "./workHours";

export type StoreConfig = {
  /** Schlüssel der Zeile in store_data – nach dem Anlegen NICHT mehr ändern. */
  id: string;
  name: string;
  /** Kurzname für den Umschalter in der Kopfzeile. */
  shortName: string;
  address: string;
  /** Belegschaft beim allerersten Öffnen. */
  sampleEmployees: () => Employee[];
  workHours?: WorkHoursConfig;
  notes?: string;
  demandProfile?: readonly DemandBand[];
  /** Welche Wochentage stark sind (Umsatz) – steuert die Stundenverteilung. */
  dayWeights: Record<WeekdayKey, number>;
  /** Wie viele Leute wann im Haus sein sollen. */
  staffingRules: readonly StaffingRule[];
};

const open = { startMinutes: 480, endMinutes: 1200 };
const kichiHours: WorkHoursConfig = {
  perWeekday: { monday: [open], tuesday: [open], wednesday: [open], thursday: [open], friday: [open], saturday: [open], sunday: [] },
  holiday: [],
  closedWeekdays: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: true },
};
const rules: readonly StaffingRule[] = [
  { priority: "required", label: "Tối thiểu 2 người buổi trưa", when: "12:00–14:00", minStaff: 2, maxStaff: Infinity,
    scaled: false, windows: clip(720, 840) },
  { priority: "coverage", label: "Hỗ trợ cao điểm tối", when: "18:00–20:00", minStaff: 2, maxStaff: Infinity,
    scaled: false, windows: clip(1080, 1200) },
];
export const STORES: StoreConfig[] = [{
  id: "kichi", name: "Kichi Vietnamese Foodtour", shortName: "Kichi",
  address: "Beim Strohhause 8, 20097 Hamburg", sampleEmployees: kichiEmployees,
  workHours: kichiHours, staffingRules: rules,
  demandProfile: [
    { startMinutes: 480, endMinutes: 720, level: 0.7, label: "Chuẩn bị" },
    { startMinutes: 720, endMinutes: 840, level: 2, label: "Cao điểm trưa" },
    { startMinutes: 840, endMinutes: 1080, level: 0.7, label: "Ngoài cao điểm" },
    { startMinutes: 1080, endMinutes: 1200, level: 1.6, label: "Cao điểm tối" },
  ],
  dayWeights: { monday: 1.2, tuesday: 1.2, wednesday: 1.2, thursday: 1.2, friday: 1.2, saturday: 1, sunday: 0 },
  notes: "Mở 8–20h, nghỉ Chủ nhật và ngày lễ Hamburg. Trưa 12–14h tối thiểu 2 người (tính cả chủ). Cao điểm tối 18–20h. Chủ hỗ trợ cả ngày. Không có bồi riêng; Kasse/phụ bếp dùng nhãn Kasse / Phụ bếp. Lương giờ 13,90 € tạm tính; cần xác nhận giờ hợp đồng.",
}];

export const DEFAULT_STORE_ID = STORES[0].id;

/** Merkt sich die zuletzt gewählte Filiale auf diesem Gerät. */
const STORE_KEY = "kichi-app:store";

export function loadStoreId(): string {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && STORES.some((s) => s.id === saved)) return saved;
  } catch {
    /* ignorieren */
  }
  return DEFAULT_STORE_ID;
}

export function saveStoreId(id: string): void {
  try {
    localStorage.setItem(STORE_KEY, id);
  } catch {
    /* ignorieren */
  }
}

export function storeById(id: string): StoreConfig {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}

/**
 * Ältere Stände (gespeichert, bevor Nieu 37 dazukam) kennen noch keinen
 * personKey. Dann erkennt „Tạo lịch làm việc" nicht, dass Bá Việt Nguyen im
 * Shin und im Nieu derselbe Mensch ist, und plant ihn am selben Tag in beiden
 * Läden. Fehlt der personKey, übernimmt ein Mitarbeiter mit derselben id und
 * demselben Namen wie in der Startbelegschaft personKey und – nur in diesem
 * einen Schritt – auch maxDaysPerWeek. Danach steht der personKey im Stand, und
 * ein später geleertes „tối đa … ngày/tuần" bleibt leer. Löst man die
 * Verbindung im Tab Nhân viên, steht dort "" statt nichts.
 */
export function withSharedPersonDefaults(employees: Employee[], store: StoreConfig): Employee[] {
  const starters = new Map(store.sampleEmployees().map((e) => [e.id, e]));
  return employees.map((employee) => {
    const starter = starters.get(employee.id);
    // "" = im Tab Nhân viên bewusst gelöst – dann nicht wieder verbinden.
    if (employee.personKey !== undefined || !starter?.personKey || starter.name !== employee.name) return employee;
    return {
      ...employee,
      personKey: starter.personKey,
      maxDaysPerWeek: employee.maxDaysPerWeek ?? starter.maxDaysPerWeek,
    };
  });
}

/** Startstand einer Filiale: September 2026 mit der Belegschaft aus der Angabe. */
export function initialScheduleFor(store: StoreConfig): Schedule {
  return {
    companyName: store.name,
    address: store.address,
    year: 2026,
    month: 10,
    workHours: structuredClone(store.workHours ?? DEFAULT_WORK_HOURS),
    dateOverrides: [],
    employees: store.sampleEmployees(),
    shifts: [],
  };
}
