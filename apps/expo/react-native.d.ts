/// <reference types="react-native" />

// Override React Native Flow types with TypeScript
declare module 'react-native' {
  import * as ReactNative from 'react-native';
  export = ReactNative;
  export as namespace ReactNative;
}

// Ensure proper typing for React Native modules
declare module 'react-native/index.js' {
  export * from 'react-native';
}