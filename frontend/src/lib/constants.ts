import type { ServiceType } from "../types";

/** Toshkent shahridagi tumanlar */
export const TASHKENT_DISTRICTS = [
  "Bektemir",
  "Chilonzor",
  "Mirobod",
  "Mirzo Ulug'bek",
  "Sergeli",
  "Shayxontohur",
  "Olmazor",
  "Uchtepa",
  "Yakkasaroy",
  "Yashnobod",
  "Yunusobod",
  "Yangihayot",
] as const;

/** Qo'shimcha xizmat turlari (UI yorliqlari) */
export const SERVICE_TYPES: { value: ServiceType; label: string; hasImage: boolean }[] = [
  { value: "SINGER", label: "Honanda", hasImage: true },
  { value: "KARNAY", label: "Karnay-surnay", hasImage: false },
  { value: "MENU", label: "Menu (taom)", hasImage: true },
  { value: "CAR", label: "Mashina", hasImage: true },
];

export const SERVICE_LABEL: Record<ServiceType, string> = {
  SINGER: "Honanda",
  KARNAY: "Karnay-surnay",
  MENU: "Menu",
  CAR: "Mashina",
  FOOD: "Taom",
  MUSIC: "Musiqa",
  DECOR: "Bezak",
};
