/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }, // leftover placeholder-post photography
      // Real featured images. rsync + nginx (plan.md §6) haven't happened yet, so
      // dev hot-links the live WP host directly; swap to the VPS's own uploads
      // path once media transfer lands.
      { protocol: "https", hostname: "lawsforum.com", pathname: "/wp-content/uploads/**" },
    ],
  },
};

export default nextConfig;
