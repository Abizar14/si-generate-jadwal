/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdf.js (legacy v3) mereferensi modul Node "canvas" yang hanya dipakai saat
    // render di server. Kita pakai pdf.js murni di browser (cuma ekstrak teks),
    // jadi stub-kan agar tidak gagal di-bundle.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
