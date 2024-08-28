module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint'],
    rules: {
        'prettier/prettier': ['error', {
            semi: false  // 禁用分号
        }],
        // 添加其他 ESLint 规则
    },
}