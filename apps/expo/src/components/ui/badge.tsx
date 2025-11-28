import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View } from "react-native";

import { cn } from "~/lib/utils";
import { TextClassContext } from "~/components/ui/text";

const badgeVariants = cva(
  "flex flex-row items-center rounded-full px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        success: "bg-green-600",
        warning: "bg-amber-500",
        outline: "border border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      success: "text-white",
      warning: "text-white",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  );
}

export { Badge, badgeVariants, badgeTextVariants };
export type { BadgeProps };
