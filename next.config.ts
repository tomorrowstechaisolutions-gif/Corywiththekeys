import path from "node:path";

import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // There is a stray package-lock.json further up the user's home directory.
  // Without this, Turbopack walks up and picks the wrong workspace root.
  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    remotePatterns: [
      // Vehicle photos served from the public Supabase Storage bucket.
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
