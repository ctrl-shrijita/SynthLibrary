import { env } from "./config/env.js";

export const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const calculateFine = (dueDate, returnDate = new Date()) => {
  const overdueMs = new Date(returnDate).getTime() - new Date(dueDate).getTime();
  if (overdueMs <= 0) return 0;

  const overdueDays = Math.ceil(overdueMs / (1000 * 60 * 60 * 24));
  return overdueDays * env.finePerDay;
};

export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: Boolean(user.emailVerified)
});
