import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false, // Quita el indicador de estatus de renderizado
    buildActivity: false, // Quita el indicador de compilación
  },
};

export default nextConfig;
