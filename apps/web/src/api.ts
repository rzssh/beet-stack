type StartAPIHandlerCallback = (ctx: { request: Request }) => Response | Promise<Response>;

export function createStartAPIHandler(callback: StartAPIHandlerCallback) {
  return async function handler(request: Request) {
    return callback({ request });
  };
}

export const defaultAPIFileRouteHandler: StartAPIHandlerCallback = async () =>
  new Response("Not Found", { status: 404 });

export default createStartAPIHandler(defaultAPIFileRouteHandler);
