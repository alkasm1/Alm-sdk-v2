import type { MiddlewareContext, MiddlewareFn } from '../types/index.js';

export function EncodingMiddleware(): MiddlewareFn {
  return async (ctx: MiddlewareContext, next: () => Promise<void>) => {
    // Encode opcode with prefix for protocol versioning
    ctx.metadata = {
      ...ctx.metadata,
      originalOpcode: ctx.request.opcode,
      encodedOpcode: `alm:v2:${ctx.request.opcode}`,
    };

    ctx.request.opcode = ctx.metadata.encodedOpcode as string;

    await next();
  };
}
