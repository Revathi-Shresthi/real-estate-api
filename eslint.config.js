import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];