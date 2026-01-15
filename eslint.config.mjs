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
            "wa-injector/**",
            // Ignore binary/generated files
            "**/database.types.ts",
            "**/*.types.ts"
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
            // React Hooks - change errors to warnings for flexibility
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/set-state-in-effect": "warn", // Allow setState in effects (common pattern)
            "react-hooks/immutability": "warn",

            // TypeScript
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],

            // Console
            "no-console": ["warn", { "allow": ["warn", "error"] }],

            // React
            "react/no-unescaped-entities": "warn", // Allow quotes in JSX

            // Next.js
            "@next/next/no-assign-module-variable": "warn", // Allow module assignments

            // Import/Export
            "import/no-anonymous-default-export": "warn" // Allow anonymous exports
        }
    },
    // Relaxed rules for development scripts and utilities
    {
        files: [
            "src/scripts/**/*.ts",
            "src/lib/**/*.ts",
            "src/utils/**/*.ts"
        ],
        rules: {
            "no-console": "off", // Allow console in dev scripts
            "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in utilities
            "no-unused-vars": "off",
            "react-hooks/set-state-in-effect": "off", // Allow any hook patterns in utilities
            "react-hooks/exhaustive-deps": "off"
        }
    }
];

export default eslintConfig;
