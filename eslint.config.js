import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    root: true,
    files: ["**/*.ts"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended"],
    env: {
      node: true,
      jest: true,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]);
