// eslint-disable-next-line spaced-comment
/// <reference types="vitest" />

import { defineConfig } from "vite";

import eslint from "vite-plugin-eslint";


export default defineConfig({
  base: '/lit-pdf/',
  plugins: [
    eslint({
      failOnWarning: false,
      failOnError: false,
    }),
  ],
  test: {
    environment: 'jsdom',
  },
});
