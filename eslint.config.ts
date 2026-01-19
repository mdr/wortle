import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import react from "eslint-plugin-react"
import reactCompiler from "eslint-plugin-react-compiler"
import jsxA11y from "eslint-plugin-jsx-a11y"
import unusedImports from "eslint-plugin-unused-imports"
import simpleImportSort from "eslint-plugin-simple-import-sort"

const config = [
  {
    ignores: ["dist/", "node_modules/", "playwright/.cache/", "src/routeTree.gen.ts", "*.config.*", ".stryker-tmp/"],
  },
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/naming-convention": ["error", { selector: "enumMember", format: ["UPPER_CASE"] }],
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
      react,
      "react-compiler": reactCompiler,
      "jsx-a11y": jsxA11y,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/no-unescaped-entities": "off",
      "react/self-closing-comp": "error",
      "react/hook-use-state": "error",
      "react-compiler/react-compiler": "error",
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/tests/playwright/**/*.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/*.testUtils.ts", "**/*.testUtils.tsx", "src/tests/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*.test", "*.testUtils", "**/*.test", "**/*.testUtils"],
              message: "Do not import test files into production code.",
            },
          ],
        },
      ],
    },
  },
]

export default config
