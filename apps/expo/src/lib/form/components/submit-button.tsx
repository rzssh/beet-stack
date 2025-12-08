import type { VariantProps } from "class-variance-authority";

import { Button, type buttonVariants } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

import { useFormContext } from "../context";

interface SubmitButtonProps extends VariantProps<typeof buttonVariants> {
  label: string;
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({ label, className, disabled, variant, size }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
      {({ canSubmit, isSubmitting }) => (
        <Button
          variant={variant}
          size={size ?? "lg"}
          onPress={form.handleSubmit}
          disabled={!canSubmit || isSubmitting || disabled}
          className={cn("rounded-xl", className)}
        >
          {isSubmitting ? <Spinner size="small" color="white" /> : <Text className="font-semibold text-lg">{label}</Text>}
        </Button>
      )}
    </form.Subscribe>
  );
}
