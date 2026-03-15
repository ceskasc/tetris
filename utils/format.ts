import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: tr,
  });
}
