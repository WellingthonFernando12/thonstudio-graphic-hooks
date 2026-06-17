const isProduction = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? "/thonstudio-graphic-hooks" : "",
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isProduction ? "/thonstudio-graphic-hooks" : "",
  assetPrefix: isProduction ? "/thonstudio-graphic-hooks/" : "",
};

export default nextConfig;
