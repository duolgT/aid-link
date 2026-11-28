
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false
      },

      includeAssets: [
        "aidlink-icon.svg",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png"
      ],

      manifest: {
        name: "AidLink Kakuma - Community Support",
        short_name: "AidLink",
        description: "Offline-first community service discovery and support platform for Kakuma. Find essential services, emergency guidance, and report community issues.",

        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",

        background_color: "#f8fafc",
        theme_color: "#087c75",

        categories: ["health", "lifestyle", "social", "utilities"],
        
        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],

        screenshots: [
          {
            src: "/screenshot-mobile.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          },
          {
            src: "/screenshot-desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
    }),
  ],
});
