export default {
  'balloon-auth-service/**/*.ts': [
    'npm --prefix balloon-auth-service exec -- prettier --write',
    'npm --prefix balloon-auth-service exec -- eslint --fix',
  ],

  'balloon-core-service/**/*.ts': [
    'npm --prefix balloon-core-service exec -- prettier --write',
    'npm --prefix balloon-core-service exec -- eslint --fix',
  ],

  'balloon-ui/**/*.{ts,tsx,js,jsx}': [
    'npm --prefix balloon-ui exec -- prettier --write',
    'npm --prefix balloon-ui exec -- eslint --config balloon-ui/eslint.config.mjs --fix',
  ],

  'balloon-ui/**/*.{css,scss,json,md}': [
    'npm --prefix balloon-ui exec -- prettier --write',
  ],
};