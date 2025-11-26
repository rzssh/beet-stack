import { useForm } from "@tanstack/react-form";
import { Loader2, Save, X } from "lucide-react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { FormInputField, FormTextareaField } from "~/components/forms/form-field";
import { Badge } from "~/components/ui/badge";

const messageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(1000, "Content must not exceed 1000 characters"),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  formTitle: string;
  submitLabel: string;
  onSubmit: (data: MessageFormData) => void | Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<MessageFormData>;
  onCancel?: () => void;
  showFormState?: boolean;
}

export function MessageForm({
  formTitle,
  submitLabel,
  onSubmit,
  isSubmitting,
  initialValues,
  onCancel,
  showFormState = false,
}: MessageFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      // Reset form after successful submission
      form.reset();
    },
    validators: {
      onChange: messageSchema,
    },
  });

  return (
    <Card>
      {formTitle && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {formTitle}
            {showFormState && (
              <form.Subscribe
                selector={(state) => [state.isDirty, state.isValid]}
                children={([isDirty, isValid]) => (
                  <div className="flex gap-2">
                    {isDirty && (
                      <Badge variant="secondary" className="text-xs">
                        Unsaved changes
                      </Badge>
                    )}
                    {isValid ? (
                      <Badge className="text-xs">Valid</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Invalid
                      </Badge>
                    )}
                  </div>
                )}
              />
            )}
          </CardTitle>
          <CardDescription>
            Create a new message with TanStack Form validation and real-time feedback
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="title"
            children={(field) => (
              <FormInputField
                field={field}
                label="Title"
                placeholder="Enter message title..."
                description="A descriptive title for your message"
                disabled={isSubmitting}
              />
            )}
          />

          <form.Field
            name="content"
            children={(field) => (
              <FormTextareaField
                field={field}
                label="Content"
                placeholder="Enter message content..."
                description="The main content of your message"
                rows={4}
                disabled={isSubmitting}
                showCharCount
                maxLength={1000}
              />
            )}
          />

          <div className="flex gap-3">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isFormSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isFormSubmitting}
                  className="flex-1"
                >
                  {(isSubmitting || isFormSubmitting) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {submitLabel}
                    </>
                  )}
                </Button>
              )}
            />
            
            {onCancel && (
              <form.Subscribe
                selector={(state) => state.isDirty}
                children={(isDirty) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (isDirty) {
                        if (confirm("You have unsaved changes. Are you sure you want to cancel?")) {
                          form.reset();
                          onCancel();
                        }
                      } else {
                        onCancel();
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              />
            )}
          </div>

          {showFormState && (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                isDirty: state.isDirty,
                isValid: state.isValid,
                fieldErrors: Object.keys(state.fieldMeta).filter(
                  key => {
                    const meta = state.fieldMeta[key as keyof typeof state.fieldMeta];
                    return meta?.errors?.length && meta.errors.length > 0;
                  }
                )
              })}
              children={({ canSubmit, isSubmitting, isDirty, isValid, fieldErrors }) => (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <h4 className="mb-2 font-medium text-sm">Form State Debug</h4>
                  <div className="grid gap-1 text-xs">
                    <div>Can Submit: <Badge variant={canSubmit ? "default" : "secondary"}>{canSubmit.toString()}</Badge></div>
                    <div>Is Submitting: <Badge variant={isSubmitting ? "default" : "secondary"}>{isSubmitting.toString()}</Badge></div>
                    <div>Is Dirty: <Badge variant={isDirty ? "default" : "secondary"}>{isDirty.toString()}</Badge></div>
                    <div>Is Valid: <Badge variant={isValid ? "default" : "destructive"}>{isValid.toString()}</Badge></div>
                    {fieldErrors.length > 0 && (
                      <div>Fields with errors: <Badge variant="destructive">{fieldErrors.join(", ")}</Badge></div>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
