/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
};

export default config;
