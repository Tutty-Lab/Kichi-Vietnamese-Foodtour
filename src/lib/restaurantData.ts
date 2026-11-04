import type { Employee } from "../types";

// PDF 10/2026 chỉ ghi Brutto, không ghi số giờ. 13,90 €/h là giả định cần xác nhận.
const RATE = 13.90;
function staff(id: string, name: string, salary: number, station: Employee["station"], role: string): Employee {
  return { id, name, employmentType: "TEILZEIT", station, role,
    monthlySalary: salary, hourlyRate: RATE, quotaSource: "salary", targetMinutes: Math.round(salary / RATE * 60), referenceEstimated: true, shiftHours: salary <= 603 ? { min: 2, max: 4 } : { min: 4, max: 6 }, spreadEvenly: true };
}
export function kichiEmployees(): Employee[] {
  return [
    staff("kc-6", "Hiep Sy Tran", 470, "KITCHEN", "Koch / Küchenhilfe"),
    staff("kc-9", "Xuan Trang Nguyen", 500, "BOTH", "Kasse / Küchenhilfe"),
    staff("kc-10", "Cong Thanh Vu", 300, "BOTH", "Kasse / Küchenhilfe"),
    staff("kc-11", "Vinh Hien Nguyen", 1200, "KITCHEN", "Koch / Küchenhilfe"),
    staff("kc-12", "Hong Van Ngo", 800, "KITCHEN", "Koch / Küchenhilfe"),
    restaurantOwner(),
  ];
}
export const restaurantOwner = (): Employee => ({ id: "kc-owner", name: "Chủ", employmentType: "VOLLZEIT", station: "BOTH", targetMinutes: 0, ownerSupport: true });
export const LEMONTASTE_PATCHES: Record<string, Partial<Employee>> = {};
export const lemontasteEmployees = kichiEmployees;
export const DINH_BIEN_SHIFT = { startMinutes: 1080, endMinutes: 1290 };
