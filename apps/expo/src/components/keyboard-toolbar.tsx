import { Keyboard } from "react-native";
import { KeyboardToolbar as RNKeyboardToolbar } from "react-native-keyboard-controller";

export function KeyboardToolbar() {
  return (
    <RNKeyboardToolbar>
      <RNKeyboardToolbar.Prev />
      <RNKeyboardToolbar.Next />
      <RNKeyboardToolbar.Done
        onPress={(e) => {
          e?.preventDefault?.();
          Keyboard.dismiss();
        }}
      />
    </RNKeyboardToolbar>
  );
}
