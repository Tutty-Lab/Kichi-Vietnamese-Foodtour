import type { Schedule } from "../types";
export function applyMigrations(storeId: string, schedule: Schedule): Schedule {
  const id = "2026-11-kichi-opening-10";
  if (storeId !== "kichi" || schedule.migrations?.includes(id)) return schedule;
  return { ...schedule, employees: schedule.employees.map(e => e.ownerSupport ? { ...e, name: "Chủ" } : e),
    workHours: { ...schedule.workHours, perWeekday: Object.fromEntries(Object.entries(schedule.workHours.perWeekday).map(([day, blocks]) => [day, blocks.map(b => ({ ...b, startMinutes: b.startMinutes === 480 && b.endMinutes === 1200 ? 600 : b.startMinutes }))])) as Schedule["workHours"]["perWeekday"] },
    migrations: [...(schedule.migrations ?? []), id] };
}
