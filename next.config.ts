import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // FIX for pdfkit:
    // We force Next.js to NOT bundle 'pdfkit' on the server.
    // Instead, it will be treated as an external module and 'required' at runtime.
    // This ensures that pdfkit can find its font data files (like Helvetica.afm)
    // in its own package directory within node_modules.
    if (isServer) {
      config.externals = [...config.externals, 'pdfkit'];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;