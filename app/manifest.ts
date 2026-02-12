import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeetOnce | Stop swiping. Start meeting.",
    short_name: "MeetOnce",
    description:
      "The first curated dating app made specifically for Dublin singles. 1 quality match per week.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d4542c",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
