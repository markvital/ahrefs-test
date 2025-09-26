/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@mui/utils', '@mui/material-nextjs'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
