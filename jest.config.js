module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^react-native-permissions$': '<rootDir>/__mocks__/react-native-permissions.js',
    '^@react-native-community/geolocation$': '<rootDir>/__mocks__/@react-native-community/geolocation.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@reduxjs|react-redux|redux|immer|@react-native-async-storage)/)',
  ],
};
