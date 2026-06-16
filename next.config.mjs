/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // pdf-lib / exceljs / bcryptjs are server-only; keep them out of the client bundle.
    serverComponentsExternalPackages: ["pdf-lib", "@pdf-lib/fontkit", "exceljs", "bcryptjs"],
  },
};

export default nextConfig;
