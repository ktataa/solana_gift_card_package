import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import inject from '@rollup/plugin-inject';

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      browser: true,  // Ensures it resolves modules for browser environments
      preferBuiltins: false,  // Prevents bundling of Node.js built-ins
    }),
    commonjs(),
    typescript(),
    json(),
    inject({
      // Polyfill 'global' for browser environments
      global: 'globalThis'
    }),
  ],
  external: [],
};
