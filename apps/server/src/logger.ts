import { env } from "@acme/core/env";
import { type Level, type LoggerOptions, levels, pino } from "pino";

type CustomLevels = Level | "dev";

const customLevels = {
	...levels.values,
	dev: 25,
} as { [level in CustomLevels]: number };

const options: LoggerOptions<CustomLevels> = {
	customLevels,
	useOnlyCustomLevels: true,
	level: env.NODE_ENV === "production" ? "info" : "dev",
	formatters: {
		level: (label) => ({ level: label }),
	},
	...(env.NODE_ENV === "development" && {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: true,
				ignore: "pid,hostname",
				messageFormat: "[{component}] {msg}",
				customColors: "dev:magenta",
				customLevels: Object.entries(customLevels)
					.map(([key, value]) => `${key}:${value}`)
					.join(","),
			},
		},
	}),
};

export const logger = pino<CustomLevels>(options);
