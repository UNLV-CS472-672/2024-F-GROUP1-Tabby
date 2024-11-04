// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  // need to set node to true to use node-specific rules inside eslint config and also to use jest-specific rules for testing 
  env: {
    node: true,
    jest: true,
  },
};
