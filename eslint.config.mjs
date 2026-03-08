import js from "@eslint/js";
import security from "eslint-plugin-security";

export default defineConfig([
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
    plugins: { security },
  },
]);
