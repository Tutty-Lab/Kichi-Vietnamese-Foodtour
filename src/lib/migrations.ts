import type { Schedule } from "../types";
export function applyMigrations(storeId: string, schedule: Schedule): Schedule {
  if (storeId === "kichi" && !schedule.migrations?.includes("2026-11-kichi-part-time")) {
    schedule = { ...schedule, employees: schedule.employees.map(e => e.ownerSupport ? e : {
      ...e, employmentType: "TEILZEIT" as const,
      shiftHours: e.shiftHours ?? (e.targetMinutes <= 43 * 60 ? { min: 2, max: 4 } : { min: 4, max: 6 }),
      spreadEvenly: e.spreadEvenly ?? true,
    }), migrations: [...(schedule.migrations ?? []), "2026-11-kichi-part-time"] };
  }
  const rolesId = "2026-11-kichi-soft-roles";
  if (storeId === "kichi" && !schedule.migrations?.includes(rolesId)) {
    const days = ["monday","tuesday","wednesday","thursday","friday","saturday"] as const;
    schedule = { ...schedule, employees: schedule.employees.map(e => e.id === "kc-9" ? { ...e, station: "BOTH" as const, role: "Kasse", preferredWindows: [{ days: [...days], startMinutes: 720, endMinutes: 840 }, { days: [...days], startMinutes: 1080, endMinutes: 1200 }] } : e.id === "kc-10" ? { ...e, station: "BOTH" as const, role: "Aushilfe / Küchenhilfe", preferredWindows: [{ days: [...days], startMinutes: 600, endMinutes: 840 }] } : e), migrations: [...(schedule.migrations ?? []), rolesId] };
  }
  const id = "2026-11-kichi-opening-10";
  if (storeId !== "kichi" || schedule.migrations?.includes(id)) return schedule;
  return { ...schedule, employees: schedule.employees.map(e => e.ownerSupport ? { ...e, name: "Chủ" } : e),
    workHours: { ...schedule.workHours, perWeekday: Object.fromEntries(Object.entries(schedule.workHours.perWeekday).map(([day, blocks]) => [day, blocks.map(b => ({ ...b, startMinutes: b.startMinutes === 480 && b.endMinutes === 1200 ? 600 : b.startMinutes }))])) as Schedule["workHours"]["perWeekday"] },
    migrations: [...(schedule.migrations ?? []), id] };
}
