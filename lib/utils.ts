import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMondayMorning9am(): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 8);
  monday.setHours(9, 0, 0, 0);
  return monday.getTime();
}

export function getFridayMidnight(): number {
  const now = new Date();
  const friday = new Date(now);
  friday.setDate(now.getDate() - now.getDay() + 5);
  friday.setHours(23, 59, 59, 999);
  return friday.getTime();
}
