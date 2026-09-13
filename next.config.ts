import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.VITE_QUEST_BASE_PATH || "",
};

export default nextConfig;
