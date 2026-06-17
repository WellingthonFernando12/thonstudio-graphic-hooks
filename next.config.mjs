const isProduction = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isProduction ? "/thonstudio-graphic-hooks" : "",
  assetPrefix: isProduction ? "/thonstudio-graphic-hooks/" : "",
};

export default nextConfig;
