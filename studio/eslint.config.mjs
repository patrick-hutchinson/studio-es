import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    languageOptions: {
      globals: {
        console: "readonly",
      },
    },
    rules: {
      "no-console": "off", // Optional: allows console.log without warnings
    },
  }
];
