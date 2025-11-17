type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const formatMessage = (level: LogLevel, message: string, context?: LogContext) => {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
};

const log = (level: LogLevel, message: string, context?: LogContext, error?: unknown) => {
  const text = formatMessage(level, message, context);

  switch (level) {
    case "debug":
      console.debug(text);
      break;
    case "info":
      console.info(text);
      break;
    case "warn":
      console.warn(text);
      break;
    case "error":
      console.error(text, error);
      break;
    default:
      console.log(text);
      break;
  }
};

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) => log("error", message, context, error),
  child: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => log("debug", message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) => log("info", message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) => log("warn", message, { ...defaultContext, ...context }),
    error: (message: string, error?: unknown, context?: LogContext) => log("error", message, { ...defaultContext, ...context }, error),
  }),
};
