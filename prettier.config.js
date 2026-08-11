/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions & import("@ianvs/prettier-plugin-sort-imports").PluginConfig} */
const config = {
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/.*",
    "",
    "^[.][.]/",
    "",
    "^[.]$",
    "^[.]/",
  ],
};

export default config;
