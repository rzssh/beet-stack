/// <reference types="react-native" />
import "react-native-safe-area-context";

// Extend third-party components that support className via nativewind/react-native-css
declare module "react-native-safe-area-context" {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_APP_URL?: string;
    }
  }
}
