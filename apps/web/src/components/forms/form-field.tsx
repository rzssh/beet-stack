import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "~/lib/utils";

interface FormFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  children: (field: AnyFieldApi) => React.ReactNode;
}

export function FormField({
  field,
  label,
  description,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label
          htmlFor={field.name}
          className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {children(field)}

      {field.state.meta.errors?.length > 0 && (
        <div className="space-y-1">
          {field.state.meta.errors.map((error: unknown, index: number) => (
            <p key={index} className="text-destructive text-sm">
              {typeof error === "string"
                ? error
                : (error as { message?: string })?.message ||
                  "Validation error"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface FormInputFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  type?: string;
  className?: string;
}

export function FormInputField({
  field,
  label,
  placeholder,
  description,
  disabled,
  type = "text",
  className,
}: FormInputFieldProps) {
  return (
    <FormField field={field} label={label} description={description}>
      {(field) => (
        <input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value || ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:font-medium file:text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            field.state.meta.errors?.length &&
              "border-destructive focus-visible:ring-destructive",
            className,
          )}
        />
      )}
    </FormField>
  );
}

interface FormTextareaFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export function FormTextareaField({
  field,
  label,
  placeholder,
  description,
  disabled,
  rows = 3,
  className,
  showCharCount,
  maxLength,
}: FormTextareaFieldProps) {
  return (
    <FormField field={field} label={label} description={description}>
      {(field) => (
        <div className="space-y-1">
          <textarea
            id={field.name}
            name={field.name}
            value={field.state.value || ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              field.state.meta.errors?.length &&
                "border-destructive focus-visible:ring-destructive",
              className,
            )}
          />
          {showCharCount && (
            <p className="text-muted-foreground text-xs">
              {(field.state.value || "").length}
              {maxLength ? `/${maxLength}` : ""} characters
            </p>
          )}
        </div>
      )}
    </FormField>
  );
}
