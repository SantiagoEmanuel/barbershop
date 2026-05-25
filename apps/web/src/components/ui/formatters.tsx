export function formatARS(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function todayISOArgentina() {
  const [dia, mes, ano] = new Date()
    .toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    })
    .split("/");

  return `${ano}-${Number(mes) < 10 ? 0 + mes : mes}-${dia}`;
}
