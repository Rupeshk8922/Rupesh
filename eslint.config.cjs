const globals = require("globals");
const pluginReact = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = [
  {
 ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "public/assets/**",
 "functions/**",
 "src/firebase.js",
 "src/routesConfig.js",
      "**/*.config.js",
 ],
  },
  pluginReact.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
 ...globals.node,
      },
    },
    plugins: {
 react: pluginReact,
 "react-hooks": reactHooks,
 "unused-imports": unusedImports,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
 "warn",
        {
 vars: "all",
 varsIgnorePattern: "^_",
 args: "after-used",
 argsIgnorePattern: "^_",
        }
      ]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["**/*.test.{js,jsx}"],
 languageOptions: {
      globals: globals.jest
    }
  },
];

