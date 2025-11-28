import * as React from "react";
import { View } from "react-native";

import { cn } from "~/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <View
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className,
        )}
        {...props}
      >
        <View
          className={cn("h-full bg-primary", indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </View>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
export type { ProgressProps };
