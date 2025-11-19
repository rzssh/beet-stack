import { Elysia } from 'elysia';

export const requestId = () =>
  new Elysia({ name: 'request-id' })
    .derive(({ request, set }) => {
      // Get request ID from headers or generate new one
      const requestId = 
        request.headers.get('x-request-id') ??
        request.headers.get('x-correlation-id') ??
        crypto.randomUUID();

      // Set response header for client debugging
      set.headers['x-request-id'] = requestId;

      return {
        requestId,
      };
    });