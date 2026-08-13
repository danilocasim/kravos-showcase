import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Keep Turbopack inside this app; a parent-level lockfile is unrelated.
    root: projectRoot,
  },
};

export default nextConfig;
