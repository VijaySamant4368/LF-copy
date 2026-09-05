/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }, // leftover placeholder-post photography
      // Real featured images now resolve same-origin (public/wp-content/uploads in dev,
      // nginx alias in prod — see lib/posts.ts WP_UPLOADS_BASE) — no remote host needed.
    ],
    // placeholder-cover.svg / placeholder-avatar.svg (lib/posts.ts fallbacks) are SVG,
    // which next/image blocks by default (XSS risk via embedded <script>). Both are
    // static assets we authored ourselves, not user-controlled, so this is safe —
    // paired with the CSP Next's own docs recommend for exactly this case.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
