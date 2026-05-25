export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function getTimeNow() {
  const [, dateArgentina] = new Date()
    .toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    })
    .split(",");

  const [hors, minutes] = dateArgentina.trim().split(":");

  return `${hors}:${minutes}`;
}
