/**
 * `next/image` throws during render on a src it cannot parse, so one bad
 * catalog row would take the page down. Only http(s) URLs and approved local
 * asset paths render. Kept out of the client `SafeImage` module so server
 * components can call it too.
 */
export function isRenderableImageUrl(src: string | null | undefined): src is string {
  if (!src?.trim()) return false;
  if (/^\/assets\/[a-z0-9/_-]+\.(png|webp|jpe?g)$/i.test(src)) return true;
  try {
    const { protocol } = new URL(src);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
