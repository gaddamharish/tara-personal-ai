import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "test.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        performance: "readonly",
        fetch: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-async-promise-executor": "error",
      "require-await": "warn",
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
      "no-control-regex": "off",
      "semi": "off",
      "quotes": "off",
      "indent": "off",
      "comma-dangle": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "public/**",
      "test-ai.js",
      "test-whatsapp.js",
    ],
  },
];
