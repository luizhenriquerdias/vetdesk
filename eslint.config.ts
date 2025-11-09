import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/coverage/**',
      '**/build/**',
    ],
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  tseslint.configs.recommended,

  pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      'vue/block-order': [
        'error',
        {
          'order': ['template', 'style', 'script'],
        },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': [
        'error',
        {
          'allowProps': false,
        },
      ],
    },
  },

  {
    files: ['.server/**/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },

  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
        },
      ],
      'array-bracket-spacing': ['error', 'never'],
      'array-callback-return': 'error',
      'arrow-parens': 'error',
      'arrow-spacing': 'error',
      'block-scoped-var': 'error',
      'block-spacing': ['error', 'always'],
      'brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
      'camelcase': ['error', { 'properties': 'never' }],
      'comma-dangle': [
        'error',
        {
          'arrays': 'always-multiline',
          'exports': 'always-multiline',
          'functions': 'ignore',
          'imports': 'always-multiline',
          'objects': 'always-multiline',
        },
      ],
      'comma-spacing': 'error',
      'comma-style': 'error',
      'curly': 'error',
      'dot-location': ['error', 'property'],
      'dot-notation': ['error', { 'allowKeywords': true }],
      'eol-last': 'error',
      'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
      'func-call-spacing': 'off',
      'indent': [
        'error',
        2,
        {
          'SwitchCase': 1,
          'VariableDeclarator': 'first',
        },
      ],
      'key-spacing': 'error',
      'new-cap': ['error', {
        'capIsNew': false,
        'newIsCap': true,
        'properties': false,
      }],
      'no-array-constructor': 'error',
      'no-cond-assign': 'error',
      'no-confusing-arrow': ['error', { 'allowParens': true }],
      'no-console': ['warn', { 'allow': ['error'] }],
      'no-const-assign': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'error',
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-func-assign': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-mixed-operators': 'error',
      'no-multi-assign': 'error',
      'no-multi-spaces': 'error',
      'no-new': 'error',
      'no-new-wrappers': 'error',
      'no-redeclare': 'error',
      'no-return-assign': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-shadow': 'off',
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',
      'no-unneeded-ternary': ['error', { 'defaultAssignment': false }],
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'off',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-return': 'error',
      'no-var': 'warn',
      'no-whitespace-before-property': 'error',
      'object-curly-spacing': ['error', 'always'],
      'object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-const': [
        'error',
        {
          'destructuring': 'all',
          'ignoreReadBeforeAssign': true,
        },
      ],
      'prefer-spread': 'error',
      'quotes': ['error', 'single'],
      'require-await': 'error',
      'semi': ['error', 'always'],
      'space-before-blocks': 'error',
      'space-infix-ops': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },
]);
