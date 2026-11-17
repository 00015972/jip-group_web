/**
 * Shop details the storefront API does not provide. Everything left empty is
 * simply not shown: fill these in when the shop is ready to publish them.
 */

/**
 * The shop's name on the site. The API's own names don't fit: its store is
 * the stall ("1-qator 16-dukon") and its organization the ERP account.
 */
export const BRAND = "JIP Group";

/** Prices without a currency are in the ERP's base currency. */
export const FALLBACK_CURRENCY = "so'm";

export const STORE_CONTACT = {
  /** Shown in the footer, checkout and privacy page. */
  phones: ["+998 94 472 00 17", "+998 95 842 11 11"] as string[],
  /** Where pickup orders are collected. */
  address: "Chinnibozor 1 qator 16 do‘kon",
  /** A landmark for the address, e.g. "Dehqon bozori yonida". */
  landmark: "",
};

/** Who answers questions about personal data (the /privacy page). */
export const PRIVACY_CONTACT = {
  phones: STORE_CONTACT.phones,
  email: "",
};

/** Where the map opens at checkout before the customer moves it: Tashkent. */
export const MAP_CENTER = { lat: 41.3111, lng: 69.2797 };

/** "+998 90 123 45 67" → "tel:+998901234567". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
