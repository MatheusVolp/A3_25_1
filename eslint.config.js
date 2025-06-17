
import js from '@eslint/js';
import globals from 'globals';
import vue from 'eslint-plugin-vue'; 
import parserVue from 'vue-eslint-parser'; 

export default [
  { ignores: ['dist'] }, 
  js.configs.recommended, 

  {
    files: ['**/*.{js,jsx,vue}'], 
    languageOptions: {
      ecmaVersion: 2020, 
      globals: globals.browser, 
      parser: parserVue, 
      parserOptions: {
        ecmaVersion: 'latest', 
        sourceType: 'module',
       
        extraFileExtensions: ['.vue'], 
      },
    },
    
    plugins: {
      vue,
    },
    rules: {
     
      ...vue.configs['vue3-recommended'].rules, 

      
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      
    },
  },
];