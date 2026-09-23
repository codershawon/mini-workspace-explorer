// fixed locale so the UI always looks the same
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(timestamp: number): string {
  return dateFormatter.format(timestamp);
}

export function formatItemCount(count: number): string {
  if (count === 0) return "Empty";
  return count === 1 ? "1 item" : `${count} items`;
}