export const formatDate = (date) => {
  if (!date) return "Not returned yet";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return "Not returned yet";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false
  }).format(new Date(date));
};

export const money = (amount = 0) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD"
  }).format(amount);
