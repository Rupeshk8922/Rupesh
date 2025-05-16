import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


const testFiles = ["**/*.test.js", "**/*.test.jsx"]

export default defineConfig([
  { ignores: [".vite/", "dist/"]},
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
 files: testFiles,
 languageOptions: { globals: globals.jest },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...pluginReact.configs.flat.recommended,
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
]);
