import { expect, it } from 'vitest';
import { draftFrom, draftToEmployee } from '../../components/EmployeesTab';
import { initialScheduleFor, STORES } from '../stores';
import { monthlyTargetMinutesFor } from '../contract';

it('calculates monthly salary quota and preserves direct hours when switching modes', () => {
  const draft = draftFrom(initialScheduleFor(STORES[0]).employees[0]);
  draft.ownerSupport = false;
  draft.salaryInput = 'monthly';
  draft.monthlySalary = '600';
  draft.hourlyRate = '15';
  draft.hours = '30';
  const employee = { id: 'salary-test', ...draftToEmployee(draft) };
  expect(employee.targetMinutes).toBe(40 * 60);
  expect(employee.quotaSource).toBe('salary');
  expect(monthlyTargetMinutesFor({ ...employee, monthlySalary: 900 }, [])).toBe(60 * 60);
  draft.salaryInput = 'hourly';
  const hourly = { id: 'hourly-test', ...draftToEmployee(draft) };
  expect(hourly.targetMinutes).toBe(30 * 60);
  expect(hourly.monthlySalary).toBe(600);
  expect(monthlyTargetMinutesFor(hourly, [])).toBe(30 * 60);
});
