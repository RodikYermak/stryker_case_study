import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    // ✅ let builds succeed even with TS errors
    typescript: {
        ignoreBuildErrors: true,
    },

    // ✅ skip ESLint during `next build`
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
