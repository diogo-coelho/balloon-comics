export default {
  'balloon-auth-service/**/*.ts': [
    'npm --prefix balloon-auth-service exec -- prettier --write',
    'npm --prefix balloon-auth-service exec -- eslint --fix',
  ],

  'balloon-core-service/**/*.ts': [
    'npm --prefix balloon-core-service exec -- prettier --write',
    'npm --prefix balloon-core-service exec -- eslint --fix',
  ],
};