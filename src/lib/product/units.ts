/**
 * Units of measure as the ERP names them ("Dona", "dona", "Metr kvadrat",
 * "Kilogram"). The names are free text typed in the ERP, so they are matched
 * loosely (Uzbek Latin, Russian, abbreviations) into a few kinds the site
 * knows how to label, step and weigh.
 */

export type UnitKind =
  | "piece"
  | "m"
  | "m2"
  | "m3"
  | "kg"
  | "t"
  | "l"
  | "bag"
  | "pallet"
  | "sheet"
  | "pack"
  | "other";

function normalize(name: string | null | undefined): string {
  return (name ?? "")
    .toLowerCase()
    .replace(/[ʻʼ’‘`']/g, "")
    .replace(/[.\s]+/g, " ")
    .trim();
}

const PATTERNS: [UnitKind, RegExp][] = [
  ["m2", /^(metr kvadrat|kvadrat metr|kv ?m|m2|m²|кв ?м|квадрат)/],
  ["m3", /^(metr kub|kub metr|kub|m3|m³|куб)/],
  ["m", /^(metr|метр|пог|m$)/],
  ["kg", /^(kilogramm?|kg|кг|килограмм?)/],
  ["t", /^(tonna|tn|t|тонна|тн|т)$/],
  ["l", /^(litr|l|литр|л)$/],
  ["bag", /^(qop|meshok|мешок|меш)/],
  ["pallet", /^(poddon|paddon|palet|паллет|поддон)/],
  ["sheet", /^(list|varaq|лист)/],
  ["pack", /^(pachka|quti|upakovka|пачка|упак|коробк)/],
  ["piece", /^(dona|shtuk|sht|ta$|шт|штук)/],
];

export function unitKind(name: string | null | undefined): UnitKind {
  const key = normalize(name);
  if (!key) return "piece";
  for (const [kind, pattern] of PATTERNS) if (pattern.test(key)) return kind;
  return "other";
}

/** Short label after a number or price: "dona", "m²", "kg". */
export function unitLabel(name: string | null | undefined): string {
  switch (unitKind(name)) {
    case "piece":
      return "dona";
    case "m":
      return "m";
    case "m2":
      return "m²";
    case "m3":
      return "m³";
    case "kg":
      return "kg";
    case "t":
      return "t";
    case "l":
      return "l";
    case "bag":
      return "qop";
    case "pallet":
      return "poddon";
    case "sheet":
      return "list";
    case "pack":
      return "pachka";
    default:
      return (name ?? "").trim().toLowerCase() || "dona";
  }
}

/**
 * Measured goods can be ordered in fractions (2.5 m², 0.5 kg of nails);
 * counted goods only in whole units.
 */
export function allowsDecimal(name: string | null | undefined): boolean {
  return ["m", "m2", "m3", "kg", "t", "l"].includes(unitKind(name));
}

/** The smallest amount that can be ordered. */
export function minQty(decimal: boolean): number {
  return decimal ? 0.1 : 1;
}

/** One decimal for measured goods, whole numbers for counted goods. */
export function roundQty(value: number, decimal: boolean): number {
  return decimal ? Math.round(value * 10) / 10 : Math.floor(value + 1e-9);
}
