import type { NextConfig } from "next";

// La página se genera como archivos estáticos (carpeta `out/`) para publicarla en
// Cloudflare Pages: comando de build `npm run build`, carpeta de salida `out`.
const nextConfig: NextConfig = {
  output: "export",
  // Sin servidor no hay optimizador de imágenes de Next: se sirven tal cual.
  images: { unoptimized: true },
};

export default nextConfig;
