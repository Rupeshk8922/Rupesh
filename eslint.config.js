import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import ts from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import parserTs from "@typescript-eslint/parser"; // Import the parser

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: parserTs, // Specify the TypeScript parser
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: react,
      "@typescript-eslint": ts,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs["recommended"].rules, // Extend recommended TypeScript rules
      // Add or override other rules here
    },
  },
];
