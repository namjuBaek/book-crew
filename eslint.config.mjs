import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js 기본 규칙 및 TypeScript 규칙
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Prettier와의 충돌 방지
  ...compat.extends("prettier"),

  // 공통 규칙
  {
    rules: {
      // 문자열은 큰따옴표 사용
      quotes: ["error", "double"],

      // 세미콜론 필수
      semi: ["error", "always"],

      // console.log 사용 경고
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // 미사용 변수 경고
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // TypeScript 관련 규칙
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",

      // React 관련 규칙
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 무시할 파일/폴더
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
      "**/*.d.ts",
    ],
  },
];

export default eslintConfig;
