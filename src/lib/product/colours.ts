/**
 * Variant colours. The shop names each variant after its colour in free text
 * ("Qora", "Och ko‘k", "Apelsin rang ", "jigarrang"), so names are matched
 * loosely into colours the site can draw as swatches.
 */

export interface Colour {
  /** Groups spellings of one colour: "qora" for "Qora", "qora " and "Чёрный". */
  id: string;
  /** As the shop typed it, trimmed, first letter capitalised: "Och ko‘k". */
  label: string;
  /** A CSS background; null when the name is not a colour the site knows. */
  swatch: string | null;
}

/**
 * Shades before their base colour ("och ko'k" before "ko'k"), since patterns
 * only anchor at the start. Patterns run on folded text (see `fold`).
 * "kigarrang" and "yashik" are typos seen in the ERP for "jigarrang"/"yashil".
 */
const COLOURS: { id: string; pattern: RegExp; swatch: string }[] = [
  { id: "toq-kok", pattern: /^(to'?q ko'?k|temno.?sin|navy)/, swatch: "#1e2a5a" },
  { id: "och-kok", pattern: /^(och ko'?k|havorang|moviy|golub|голуб)/, swatch: "#8ec5ec" },
  { id: "toq-yashil", pattern: /^(to'?q yashil|temno.?zel)/, swatch: "#1f6b3a" },
  { id: "och-yashil", pattern: /^(och yashil|salat)/, swatch: "#9fd88f" },
  { id: "yorqin-yashil", pattern: /^yorqin yashil/, swatch: "#2fcf4a" },
  { id: "och-pushti", pattern: /^och pushti/, swatch: "#f7c6d8" },
  { id: "toq-malla", pattern: /^to'?q malla/, swatch: "#94572a" },
  { id: "toq-jigarrang", pattern: /^to'?q [jk]igar/, swatch: "#4a2c1a" },
  { id: "qora", pattern: /^(qora|chyorn|chorn|chern|black|чёрн|черн)/, swatch: "#1b1c22" },
  { id: "oq", pattern: /^(oq\b|bel|white|бел)/, swatch: "#ffffff" },
  { id: "kok", pattern: /^(ko'?k|kuk|sin|blue|син)/, swatch: "#2f5fd0" },
  { id: "feruza", pattern: /^(feruza|biruz|turquoise|бирюз)/, swatch: "#1fb3ac" },
  { id: "tiffani", pattern: /^(tiff?an[iy]|tiffany)/, swatch: "#81d8d0" },
  { id: "yalpiz", pattern: /^(yalpiz|myat|mint|мят)/, swatch: "#a8e6cf" },
  { id: "laym", pattern: /^(laym|laim|lime|лайм)/, swatch: "#b5d93a" },
  { id: "yashil", pattern: /^(yashil|yashik$|zel[eyo]n|green|зел[её]н)/, swatch: "#2f9e57" },
  { id: "apelsin", pattern: /^(apelsin|to'?q sariq|oranj|orange|оранж)/, swatch: "#f28a1e" },
  { id: "qizil", pattern: /^(qizil|krasn|red|красн)/, swatch: "#d9342b" },
  { id: "pushti", pattern: /^(pushti|rozov|pink|розов)/, swatch: "#f08bb4" },
  { id: "binafsha", pattern: /^(binafsha|siyohrang|fiolet|purple|violet|фиолет)/, swatch: "#7b4fd6" },
  { id: "sariq", pattern: /^(sariq|j[eyo]lt|yellow|ж[её]лт)/, swatch: "#f5c935" },
  { id: "malla", pattern: /^(malla|ryzh|рыж)/, swatch: "#c98a4b" },
  { id: "qaymoq", pattern: /^(qaymoq|krem|cream|bej|beige|беж|крем)/, swatch: "#f1e4c3" },
  { id: "kulrang", pattern: /^(kulrang|ser[iy]|grey|gray|сер)/, swatch: "#9a9ea8" },
  { id: "jigarrang", pattern: /^([jk]igarrang|kar[ia]ch|korich|brown|коричн|shokolad|шоколад)/, swatch: "#7a4a2a" },
];

/** Lower case, one kind of apostrophe, single spaces. */
export function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ʻʼ’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** "jigarrang " → "Jigarrang"; the rest as the shop typed it. */
function capitalise(value: string): string {
  const text = value.trim().replace(/\s+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function match(word: string) {
  return COLOURS.find((c) => c.pattern.test(word)) ?? null;
}

/** Two-tone names ("Qora-oq", "Qora + qizil") split the swatch in halves. */
const PARTS = /\s*(?:[-+/,&]|\bva\b|\bи\b)\s*/;

/** What a variant name is: its colour group, its label, and a swatch when the site knows it. */
export function colourOf(name: string): Colour {
  const key = fold(name);
  const label = capitalise(name);
  // Two-tone first: patterns anchor at the start, so "qora-oq" alone would read as black.
  const parts = key.split(PARTS).filter(Boolean);
  const found = parts.map(match);
  if (parts.length > 1 && found.every(Boolean)) {
    const [a, b] = found as NonNullable<ReturnType<typeof match>>[];
    if (a.id !== b.id) {
      return { id: `${a.id}+${b.id}`, label, swatch: `linear-gradient(135deg, ${a.swatch} 0 50%, ${b.swatch} 50% 100%)` };
    }
  }
  const whole = match(key);
  if (whole) return { id: whole.id, label, swatch: whole.swatch };
  return { id: key, label, swatch: null };
}

/**
 * The swatch of each option, when every one of several options names a colour
 * the site knows; otherwise null, and the options are shown by name.
 */
export function colourSwatches<T extends { label: string }>(options: T[]): Map<T, Colour> | null {
  if (options.length < 2) return null;
  const map = new Map<T, Colour>();
  for (const option of options) {
    const colour = colourOf(option.label);
    if (!colour.swatch) return null;
    map.set(option, colour);
  }
  return map;
}
