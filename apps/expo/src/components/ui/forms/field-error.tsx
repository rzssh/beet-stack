import { Text } from "../text";

interface FieldErrorProps {
  errors: string[];
  show: boolean;
}

export function FieldError({ errors, show }: FieldErrorProps) {
  if (!show || errors.length === 0) return null;

  return (
    <>
      {errors.map((message) => (
        <Text key={message} className="text-destructive text-sm" role="alert">
          {message}
        </Text>
      ))}
    </>
  );
}
