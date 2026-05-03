import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
    // JS + TS base
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
        languageOptions: {
            globals: globals.browser,
        },
        extends: [js.configs.recommended],
    },

    // TypeScript
    ...tseslint.configs.recommended,

    // Vue recommended
    ...pluginVue.configs["flat/essential"],

    // Vue files parsing FIX
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },
]);