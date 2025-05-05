import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  // experimental: {
  // Enables copying of files from the source directory to the output directory
  outputFileTracingRoot: process.cwd(),
  // Include the templates directory in the file tracing
  outputFileTracingIncludes: {
    "/": ["templates/**/*"],
  },
  // },
};

export default nextConfig;
