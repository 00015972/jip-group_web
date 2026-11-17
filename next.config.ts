import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Product photos are whatever URL the shop owner pasted into the ERP: the
     * dukonline CDN, or a search-result thumbnail. The hosts can't be listed up
     * front, and an unlisted host makes `next/image` throw during render, so
     * every host is allowed and bad URLs are handled by `SafeImage`. The URLs
     * come from the authenticated shop owner, not from visitors.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
