import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  // Playwright and local Supabase use the loopback hostname explicitly.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    // Keep Turbopack inside this app; a parent-level lockfile is unrelated.
    root: projectRoot,
  },
};

export default nextConfig;
