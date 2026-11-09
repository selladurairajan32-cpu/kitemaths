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
      // The hubs /practice, /lab and /start are pages that open the learner's current island (DEF-014).
      // The design mock-ups are no longer public (DEF-016): they are in docs/design-previews/.
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
