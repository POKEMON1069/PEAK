import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep file tracing inside the project root.
  outputFileTracingRoot: here,

  // The dev server is viewed through a proxied preview host, so Next needs to
  // be told that requests from it are expected.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost", "127.0.0.1"],
};

export default nextConfig;
