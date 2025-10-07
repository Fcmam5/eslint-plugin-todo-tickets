import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import security from "eslint-plugin-security";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, security },
    extends: [security.configs.recommended],
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
]);
