/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }, // leftover placeholder-post photography
      // Real featured images now resolve same-origin (public/wp-content/uploads in dev,
      // nginx alias in prod — see lib/posts.ts WP_UPLOADS_BASE) — no remote host needed.
    ],
  },
};

export default nextConfig;
