import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache yet: the `revalidate` fetches in the storefront client
// reach the ERP on every request. Add the R2 cache if that traffic becomes a
// problem: https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig();
