import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "prettier"),
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "public/**",
            "*.sql",
            "*.md",
            "*.sh",
            "*.ps1",
            "chrome-extension/**",
            "extension/**",
            "wa-injector/**"
        ]
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default
        },
        languageOptions: {
            parser: (await import("@typescript-eslint/parser")).default,
        },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "no-console": ["warn", { "allow": ["warn", "error"] }]
        }
    }
];

export default eslintConfig;
