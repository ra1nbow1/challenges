module.exports = {
  root: true,
  env: { browser: true, es2020: true, "jest": true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  settings: { react: { version: '18.2' } },
  plugins: ['react', 'react-refresh'],
  rules: {
    'react-refresh/only-export-components': [ 'warn', { allowConstantExport: true } ],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-var-requires': 'warning',
  },
}
