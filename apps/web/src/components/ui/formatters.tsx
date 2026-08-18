export function formatARS(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatCent(cents: number) {
  return cents / 100;
}

// Formatea centavos a una cadena apta para inputs (ej. "3.500" o "3.500,50")
export function formatCentsForInput(cents: number) {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return "";
  const pesos = cents / 100;
  return pesos.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Parsea una cadena de entrada de moneda y devuelve centavos (o null si está vacía/incorrecta)
export function parseCurrencyToCents(input: string): number | null {
  if (!input) return null;
  // eliminar símbolos de moneda y espacios
  const cleaned = String(input)
    .replace(/\s/g, "")
    .replace(/[¤$€£₲₱]/g, "")
    // eliminar separador de miles (puntos)
    .replace(/\./g, "")
    // convertir coma decimal a punto
    .replace(/,/g, ".");

  const num = Number(cleaned);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
