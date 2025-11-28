import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Text as RNText } from "react-native";

import { cn } from "~/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

const textVariants = cva("text-base text-foreground", {
  variants: {
    variant: {
      default: "",
      h1: "text-4xl font-extrabold tracking-tight",
      h2: "text-3xl font-semibold tracking-tight",
      h3: "text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      large: "text-xl font-semibold",
      lead: "text-xl text-muted-foreground",
      p: "leading-7",
      blockquote: "border-l-2 border-border pl-4 italic",
      code: "bg-muted rounded px-1.5 py-0.5 font-mono text-sm font-semibold",
      muted: "text-sm text-muted-foreground",
      small: "text-sm font-medium leading-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const getRole = (variant: string | null | undefined): "heading" | undefined => {
  switch (variant) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return "heading";
    default:
      return undefined;
  }
};

const getAriaLevel = (variant: string | null | undefined) => {
  switch (variant) {
    case "h1":
      return 1;
    case "h2":
      return 2;
    case "h3":
      return 3;
    case "h4":
      return 4;
    default:
      return undefined;
  }
};

type TextProps = React.ComponentPropsWithoutRef<typeof RNText> &
  VariantProps<typeof textVariants> & {
    asChild?: boolean;
  };

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Comp = asChild ? Slot.Text : RNText;
    return (
      <Comp
        role={getRole(variant)}
        aria-level={getAriaLevel(variant)}
        className={cn(textVariants({ variant }), textClass, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, TextClassContext, textVariants };
export type { TextProps };
