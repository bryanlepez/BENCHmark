export function formatTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
