/** Narxni so'mda formatlash: 1200000 -> "1 200 000 so'm" */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(value)) + " so'm";
}

/** Sanani o'qiladigan ko'rinishga: "12.06.2026" */
export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Sana faqat YYYY-MM-DD (vaqtsiz, lokal) */
export function toDateKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Bugundan oldinmi? (kun aniqligida) */
export function isPast(value: string | Date): boolean {
  const d = typeof value === "string" ? new Date(value) : value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(d);
  cmp.setHours(0, 0, 0, 0);
  return cmp < today;
}

/** className larni birlashtirish */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
