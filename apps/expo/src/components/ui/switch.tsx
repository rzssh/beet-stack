import * as SwitchPrimitive from "@rn-primitives/switch";
import * as React from "react";

import { cn } from "~/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "h-7 w-12 shrink-0 rounded-full border-2 border-transparent",
      props.checked ? "bg-primary" : "bg-input",
      props.disabled && "opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "h-6 w-6 rounded-full bg-background shadow-md shadow-black/20",
        props.checked ? "translate-x-5" : "translate-x-0",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
