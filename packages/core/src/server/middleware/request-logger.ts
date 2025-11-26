import { Elysia } from "elysia";
import type { Logger } from "./attach";

/**
 * Request logging middleware using Elysia lifecycle hooks
 * Logs: incoming requests, response times, errors, and completion
 */
export const requestLogger = (logger: Logger) =>
	new Elysia({ name: "request-logger" })
		.onRequest(({ request }) => {
			const url = new URL(request.url);
			logger.debug(
				{
					method: request.method,
					path: url.pathname,
					query: url.search || undefined,
					userAgent: request.headers.get("user-agent"),
					contentType: request.headers.get("content-type"),
				},
				"Incoming request",
			);
		})
		.resolve(({ request }) => ({
			requestId:
				request.headers.get("x-request-id") ??
				request.headers.get("x-correlation-id") ??
				crypto.randomUUID(),
			startTime: performance.now(),
		}))
		.onAfterResponse(({ request, requestId, startTime, response }) => {
			const duration = Math.round(performance.now() - startTime);
			const url = new URL(request.url);
			const status =
				response instanceof Response ? response.status : (response as number);

			const logData = {
				requestId,
				method: request.method,
				path: url.pathname,
				status,
				duration: `${duration}ms`,
			};

			if (status >= 500) {
				logger.error(logData, "Request failed");
			} else if (status >= 400) {
				logger.warn(logData, "Request client error");
			} else {
				logger.info(logData, "Request completed");
			}
		});
