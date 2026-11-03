import type { NextConfig } from "next";

/** Fractions was the only topic before topics got their own URLs (/t/<topic>/...). */
const LEGACY_TOPIC = "fractions";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    const t = `/t/${LEGACY_TOPIC}`;
    return [
      // Old fractions links (bookmarks, shared links): moved for good.
      { source: "/lesson", destination: `${t}/lesson`, permanent: true },
      { source: "/lesson/:lessonId", destination: `${t}/lesson/:lessonId`, permanent: true },
      { source: "/lesson/:lessonId/:step", destination: `${t}/lesson/:lessonId/:step`, permanent: true },
      { source: "/practice/:skill", destination: `${t}/practice/:skill`, permanent: true },
      { source: "/assessment", destination: `${t}/check`, permanent: true },
      { source: "/assessment/recheck/:skill", destination: `${t}/recheck/:skill`, permanent: true },
      // Hubs: for now they open the first island; they'll become pickers as islands are added.
      { source: "/practice", destination: `${t}/practice`, permanent: false },
      { source: "/lab", destination: `${t}/lab`, permanent: false },
      { source: "/start", destination: `${t}/start`, permanent: false },
      // Design previews (static pages in public/preview), for the owner to check.
      { source: "/sky", destination: "/preview/sky/index.html", permanent: false },
      { source: "/crystal", destination: "/preview/crystal/index.html", permanent: false },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
