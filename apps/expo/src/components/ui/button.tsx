import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable } from "react-native";

import { cn } from "~/lib/utils";
import { TextClassContext } from "~/components/ui/text";

const buttonVariants = cva(
  "flex flex-row items-center justify-center gap-2 rounded-lg shadow-sm shadow-black/5 active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "shadow-none",
        link: "shadow-none",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-9 px-3 rounded-md",
        lg: "h-14 px-8 rounded-xl",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("font-semibold text-base", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, disabled, children, ...props }, ref) => {
  return (
    <TextClassContext.Provider
      value={buttonTextVariants({ variant, size })}
    >
      <Pressable
        role="button"
        className={cn(
          buttonVariants({ variant, size }),
          disabled && "opacity-50",
          className,
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    </TextClassContext.Provider>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
