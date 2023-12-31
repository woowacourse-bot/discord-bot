module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:jsdoc/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // ESM 사용으로 인한 파일 확장자 표기 의무화
    'import/extensions': ['error', 'always', { ignorePackages: true }],

    // JSDoc과 관련된 오류 침묵
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-returns-description': 'off',

    // dotenv/config import 관련 오류 침묵
    'import/no-extraneous-dependencies': 'off',
  },
};
