import * as React from "react";
import { Platform, TextInput, View } from "react-native";

import { cn } from "~/lib/utils";
import { Text } from "~/components/ui/text";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <View className="gap-1.5">
        {label && (
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground shadow-sm shadow-black/5",
            "placeholder:text-muted-foreground",
            props.editable === false && "opacity-50",
            error && "border-destructive",
            Platform.select({
              web: "outline-none focus:border-ring focus:ring-2 focus:ring-ring/20",
              default: "",
            }),
            className,
          )}
          placeholderTextColor="#71717a"
          {...props}
        />
        {error && (
          <Text className="text-sm text-destructive">{error}</Text>
        )}
      </View>
    );
  },
);
Input.displayName = "Input";

interface TextAreaProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const TextArea = React.forwardRef<React.ElementRef<typeof TextInput>, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <View className="gap-1.5">
        {label && (
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        )}
        <TextInput
          ref={ref}
          multiline
          textAlignVertical="top"
          className={cn(
            "min-h-24 w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground shadow-sm shadow-black/5",
            "placeholder:text-muted-foreground",
            props.editable === false && "opacity-50",
            error && "border-destructive",
            className,
          )}
          placeholderTextColor="#71717a"
          {...props}
        />
        {error && (
          <Text className="text-sm text-destructive">{error}</Text>
        )}
      </View>
    );
  },
);
TextArea.displayName = "TextArea";

export { Input, TextArea };
export type { InputProps, TextAreaProps };
