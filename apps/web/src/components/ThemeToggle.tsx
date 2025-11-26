import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ThemeToggleProps extends React.ComponentProps<typeof Button> {}

export function ThemeToggle({ ...props }: ThemeToggleProps) {
  function toggleTheme() {
    if (
      document.documentElement.classList.contains("dark") ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      onClick={toggleTheme}
      {...props}
    >
      <SunIcon className="dark:-rotate-90 size-4 rotate-0 scale-100 transition-all dark:scale-0" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
